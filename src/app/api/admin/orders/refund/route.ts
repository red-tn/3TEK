import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendRefundNotificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { orderId, amount, reason } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order can be refunded
    if (order.status === 'refunded') {
      return NextResponse.json({ error: 'Order already refunded' }, { status: 400 })
    }

    if (order.payment_status !== 'paid' && order.payment_status !== 'partially_refunded') {
      return NextResponse.json({ error: 'Order has not been paid' }, { status: 400 })
    }

    // Get payment intent ID
    const paymentIntentId = order.stripe_payment_intent_id
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'No payment found for this order' }, { status: 400 })
    }

    // Determine refund amount (full or partial)
    const refundAmount = amount || order.total_cents

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount,
      reason: reason === 'duplicate' ? 'duplicate' : reason === 'fraudulent' ? 'fraudulent' : 'requested_by_customer',
    })

    // Determine new payment status
    const isFullRefund = refundAmount >= order.total_cents
    const newPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded'
    const newOrderStatus = isFullRefund ? 'refunded' : order.status

    // Update order in database
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: newOrderStatus,
        payment_status: newPaymentStatus,
        notes: order.notes
          ? `${order.notes}\n\nRefund processed: ${formatPrice(refundAmount)} on ${new Date().toISOString()}`
          : `Refund processed: ${formatPrice(refundAmount)} on ${new Date().toISOString()}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
      // Refund still succeeded in Stripe, so we log but don't fail
    }

    // Add to status history
    await supabaseAdmin.from('order_status_history').insert({
      order_id: orderId,
      status: newOrderStatus,
      note: `Refund of ${formatPrice(refundAmount)} processed. Stripe Refund ID: ${refund.id}`,
      changed_by: user.id,
    })

    // Send refund notification email
    try {
      const shippingAddress = order.shipping_address as { fullName?: string }
      await sendRefundNotificationEmail({
        order_number: order.order_number,
        email: order.email,
        customer_name: shippingAddress?.fullName,
        refund_amount_cents: refundAmount,
        total_cents: order.total_cents,
        is_full_refund: isFullRefund,
        reason: reason === 'requested_by_customer' ? 'Customer request' : reason === 'duplicate' ? 'Duplicate order' : reason === 'fraudulent' ? 'Fraudulent' : undefined,
      })
    } catch (emailError) {
      console.error('Failed to send refund notification email:', emailError)
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
      order: {
        status: newOrderStatus,
        paymentStatus: newPaymentStatus,
      },
    })
  } catch (error) {
    console.error('Refund error:', error)
    const message = error instanceof Error ? error.message : 'Refund failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
