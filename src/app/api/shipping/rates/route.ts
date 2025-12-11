import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { subtotalCents } = await req.json()

    const supabase = await createClient()

    // Fetch active shipping rates
    const { data: rates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true })

    if (error) throw error

    // Filter rates based on order value
    const applicableRates = (rates || []).filter((rate) => {
      // Check min order threshold
      if (rate.min_order_cents && subtotalCents < rate.min_order_cents) {
        return false
      }
      // Check max order threshold (for free shipping tiers)
      if (rate.max_order_cents && subtotalCents > rate.max_order_cents) {
        return false
      }
      return true
    })

    // If no rates match, return default standard shipping
    if (applicableRates.length === 0) {
      return NextResponse.json({
        rates: [{
          id: 'default',
          name: 'Standard Shipping',
          description: '5-7 business days',
          price_cents: 599,
          estimated_days_min: 5,
          estimated_days_max: 7,
        }]
      })
    }

    return NextResponse.json({
      rates: applicableRates.map((rate) => ({
        id: rate.id,
        name: rate.name,
        description: rate.description,
        price_cents: rate.price_cents,
        estimated_days_min: rate.estimated_days_min,
        estimated_days_max: rate.estimated_days_max,
      }))
    })
  } catch (error) {
    console.error('Shipping rates error:', error)
    return NextResponse.json({ error: 'Failed to fetch shipping rates' }, { status: 500 })
  }
}
