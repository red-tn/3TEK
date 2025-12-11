import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { code, subtotalCents } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
    }

    // Check if active
    if (!coupon.is_active) {
      return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
    }

    // Check expiration date
    const now = new Date()
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }

    // Check usage limit
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }

    // Check minimum order
    if (coupon.min_order_cents && subtotalCents < coupon.min_order_cents) {
      const minOrder = (coupon.min_order_cents / 100).toFixed(2)
      return NextResponse.json({
        error: `Minimum order of $${minOrder} required for this coupon`
      }, { status: 400 })
    }

    // Calculate discount
    let discountCents = 0
    if (coupon.discount_type === 'percentage') {
      discountCents = Math.round(subtotalCents * (coupon.discount_value / 100))
    } else {
      discountCents = coupon.discount_value
    }

    // Cap discount at subtotal (can't go negative)
    discountCents = Math.min(discountCents, subtotalCents)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        description: coupon.description,
      },
      discountCents,
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
