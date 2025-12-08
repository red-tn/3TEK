import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
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
          .eq('stripe_checkout_session_id', session.id)

        if (error) {
          console.error('Error updating order:', error)
        }

        // Update inventory for each order item
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .single()

        if (order) {
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
