import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { TAX_RATE } from '@/lib/constants'

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
    const { items, shippingAddress, couponCode, shippingRateId } = (await req.json()) as {
      items: CheckoutItem[]
      shippingAddress: ShippingAddress
      couponCode?: string
      shippingRateId?: string
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

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId)!
      return acc + product.price_cents * item.quantity
    }, 0)

    // Validate and apply coupon
    let discountCents = 0
    let appliedCoupon = null
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single()

      if (!couponError && coupon && coupon.is_active) {
        const now = new Date()
        const validEnd = !coupon.expires_at || new Date(coupon.expires_at) >= now
        const validUsage = !coupon.max_uses || coupon.current_uses < coupon.max_uses
        const validMinOrder = !coupon.min_order_cents || subtotal >= coupon.min_order_cents

        if (validEnd && validUsage && validMinOrder) {
          if (coupon.discount_type === 'percentage') {
            discountCents = Math.round(subtotal * (coupon.discount_value / 100))
          } else {
            discountCents = coupon.discount_value
          }
          discountCents = Math.min(discountCents, subtotal)
          appliedCoupon = coupon
        }
      }
    }

    // Get shipping rate from database
    let shippingCents = 599 // Default fallback
    let shippingMethod = 'Standard Shipping'

    if (shippingRateId) {
      const { data: shippingRate } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('id', shippingRateId)
        .eq('is_active', true)
        .single()

      if (shippingRate) {
        shippingCents = shippingRate.price_cents
        shippingMethod = shippingRate.name
      }
    } else {
      // Auto-select best shipping rate based on order value
      const { data: rates } = await supabase
        .from('shipping_rates')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true })

      if (rates && rates.length > 0) {
        // Find first applicable rate
        const applicableRate = rates.find((rate) => {
          const meetsMin = !rate.min_order_cents || subtotal >= rate.min_order_cents
          const meetsMax = !rate.max_order_cents || subtotal <= rate.max_order_cents
          return meetsMin && meetsMax
        })
        if (applicableRate) {
          shippingCents = applicableRate.price_cents
          shippingMethod = applicableRate.name
        }
      }
    }

    // Calculate tax (on subtotal after discount)
    const taxableAmount = subtotal - discountCents
    const taxCents = Math.round(taxableAmount * TAX_RATE)

    // Calculate total
    const totalCents = subtotal - discountCents + shippingCents + taxCents

    // Create Stripe line items
    const lineItems: {
      price_data: {
        currency: string
        product_data: {
          name: string
          images?: string[]
          description?: string
        }
        unit_amount: number
      }
      quantity: number
    }[] = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      // Handle both string array and object array image formats
      const firstImage = product.images?.[0]
      const imageUrl = firstImage
        ? typeof firstImage === 'string'
          ? firstImage
          : firstImage.url
        : null

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: imageUrl ? [imageUrl] : [],
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
            description: shippingMethod,
          },
          unit_amount: shippingCents,
        },
        quantity: 1,
      })
    }

    // Add tax as line item if applicable
    if (taxCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax',
            description: `Tax (${(TAX_RATE * 100).toFixed(2)}%)`,
          },
          unit_amount: taxCents,
        },
        quantity: 1,
      })
    }

    // Generate order number
    const orderNumber = `3T-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        email: shippingAddress.email,
        subtotal_cents: subtotal,
        discount_cents: discountCents,
        shipping_cents: shippingCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        shipping_address: shippingAddress,
        coupon_code: appliedCoupon?.code || null,
        status: 'pending',
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
      // Handle both string array and object array image formats
      const firstImage = product.images?.[0]
      const imageUrl = firstImage
        ? typeof firstImage === 'string'
          ? firstImage
          : firstImage.url
        : null

      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_image: imageUrl,
        quantity: item.quantity,
        price_cents: product.price_cents,
      }
    })

    await supabaseAdmin.from('order_items').insert(orderItems)

    // Create Stripe coupon if discount applies
    let stripeCouponId: string | undefined
    if (discountCents > 0 && appliedCoupon) {
      // Create a one-time Stripe coupon for this checkout
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency: 'usd',
        name: appliedCoupon.code,
        max_redemptions: 1,
        duration: 'once',
      })
      stripeCouponId = stripeCoupon.id
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      ...(stripeCouponId && {
        discounts: [{ coupon: stripeCouponId }],
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: user?.email || shippingAddress.email,
      metadata: {
        order_id: order.id,
        coupon_code: appliedCoupon?.code || '',
        coupon_id: appliedCoupon?.id || '',
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
    })

    // Update order with session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
