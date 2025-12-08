import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DEFAULT_SHIPPING_CENTS, FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/constants'

interface CheckoutItem {
  productId: string
  quantity: number
}

interface ShippingAddress {
  email: string
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export async function POST(req: Request) {
  try {
    const { items, shippingAddress } = (await req.json()) as {
      items: CheckoutItem[]
      shippingAddress: ShippingAddress
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch products and validate
    const productIds = items.map((item) => item.productId)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError || !products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products are unavailable' },
        { status: 400 }
      )
    }

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (product?.track_inventory && product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} is out of stock` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return acc + product.price_cents * item.quantity
    }, 0)

    // Calculate shipping
    const shippingCents =
      subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : DEFAULT_SHIPPING_CENTS

    // Create Stripe line items
    const lineItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: primaryImage?.url ? [primaryImage.url] : [],
            description: product.short_description || undefined,
          },
          unit_amount: product.price_cents,
        },
        quantity: item.quantity,
      }
    })

    // Add shipping as line item if not free
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Standard Shipping',
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      })
    }

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user?.id || null,
        guest_email: !user ? shippingAddress.email : null,
        subtotal_cents: subtotal,
        shipping_cents: shippingCents,
        tax_cents: 0,
        total_cents: subtotal + shippingCents,
        shipping_address: shippingAddress,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      throw orderError
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]

      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_image: primaryImage?.url,
        quantity: item.quantity,
        unit_price_cents: product.price_cents,
        total_cents: product.price_cents * item.quantity,
      }
    })

    await supabaseAdmin.from('order_items').insert(orderItems)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: user?.email || shippingAddress.email,
      metadata: {
        order_id: order.id,
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    })

    // Update order with session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
