import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: rates, error } = await supabase
    .from('shipping_rates')
    .select('*')
    .order('min_order_cents')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(rates)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify admin status
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

  if (!profile || !profile.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const { data: rate, error } = await supabase
      .from('shipping_rates')
      .insert({
        name: body.name,
        description: body.description || null,
        rate_cents: body.rateCents,
        min_order_cents: body.minOrderCents || 0,
        max_order_cents: body.maxOrderCents || null,
        estimated_days_min: body.estimatedDaysMin || null,
        estimated_days_max: body.estimatedDaysMax || null,
        is_active: body.isActive ?? true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(rate, { status: 201 })
  } catch (err) {
    console.error('Create shipping rate error:', err)
    return NextResponse.json(
      { error: 'Failed to create shipping rate' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Shipping rate ID required' }, { status: 400 })
  }

  // Verify admin status
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

  if (!profile || !profile.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const { data: rate, error } = await supabase
      .from('shipping_rates')
      .update({
        name: body.name,
        description: body.description || null,
        rate_cents: body.rateCents,
        min_order_cents: body.minOrderCents || 0,
        max_order_cents: body.maxOrderCents || null,
        estimated_days_min: body.estimatedDaysMin || null,
        estimated_days_max: body.estimatedDaysMax || null,
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(rate)
  } catch (err) {
    console.error('Update shipping rate error:', err)
    return NextResponse.json(
      { error: 'Failed to update shipping rate' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Shipping rate ID required' }, { status: 400 })
  }

  // Verify admin status
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

  if (!profile || !profile.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { error } = await supabase.from('shipping_rates').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete shipping rate error:', err)
    return NextResponse.json(
      { error: 'Failed to delete shipping rate' },
      { status: 500 }
    )
  }
}
