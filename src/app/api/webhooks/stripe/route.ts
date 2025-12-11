import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Update order status
        const { error } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('stripe_session_id', session.id)

        if (error) {
          console.error('Error updating order:', error)
        }

        // Fetch order for inventory, coupon updates, and email
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('*, order_items(*)')
          .eq('stripe_session_id', session.id)
          .single()

        if (order) {
          // Update inventory for each order item
          const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', order.id)

          if (items) {
            for (const item of items) {
              if (item.product_id) {
                await supabaseAdmin.rpc('decrement_stock', {
                  product_id: item.product_id,
                  quantity: item.quantity,
                })
              }
            }
          }

          // Increment coupon usage if a coupon was applied
          if (order.coupon_code) {
            await supabaseAdmin.rpc('increment_coupon_usage', {
              coupon_code: order.coupon_code,
            })
          }

          // Send order confirmation email
          try {
            await sendOrderConfirmationEmail({
              order_number: order.order_number,
              email: order.email,
              subtotal_cents: order.subtotal_cents,
              discount_cents: order.discount_cents || 0,
              shipping_cents: order.shipping_cents || 0,
              tax_cents: order.tax_cents || 0,
              total_cents: order.total_cents,
              coupon_code: order.coupon_code,
              shipping_address: order.shipping_address as {
                fullName?: string
                addressLine1?: string
                addressLine2?: string
                city?: string
                state?: string
                postalCode?: string
                country?: string
              },
              order_items: order.order_items || [],
            })
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError)
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        await supabaseAdmin
          .from('orders')
          .update({
            status: 'refunded',
            payment_status:
              charge.amount_refunded === charge.amount
                ? 'refunded'
                : 'partially_refunded',
          })
          .eq('stripe_payment_intent_id', charge.payment_intent)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
