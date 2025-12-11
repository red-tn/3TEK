import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendShippingNotificationEmail } from '@/lib/email'

async function checkAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    return { error: 'Forbidden', status: 403 }
  }

  return { user }
}

export async function GET(req: Request) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const paymentStatus = searchParams.get('paymentStatus') || ''

    let query = supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        profile:profiles(id, email, full_name),
        order_items(*)
      `,
        { count: 'exact' }
      )

    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,guest_email.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return NextResponse.json({
      orders: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const auth = await checkAdminAuth()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const body = await req.json()
    const {
      status,
      shippingCarrier,
      trackingNumber,
      trackingUrl,
      adminNotes,
    } = body

    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status

      // Set shipped_at timestamp
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString()
      }

      // Set delivered_at timestamp
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }
    }

    if (shippingCarrier !== undefined) updateData.shipping_carrier = shippingCarrier
    if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber
    if (trackingUrl !== undefined) updateData.tracking_url = trackingUrl
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log status change
    if (status) {
      await supabaseAdmin.from('order_status_history').insert({
        order_id: id,
        status,
        changed_by: auth.user.id,
      })

      // Send shipping notification email when status is changed to shipped
      if (status === 'shipped') {
        try {
          // Fetch full order with items for email
          const { data: fullOrder } = await supabaseAdmin
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single()

          if (fullOrder) {
            await sendShippingNotificationEmail({
              order_number: fullOrder.order_number,
              email: fullOrder.email,
              shipping_carrier: fullOrder.shipping_carrier,
              tracking_number: fullOrder.tracking_number,
              tracking_url: fullOrder.tracking_url,
              estimated_delivery: fullOrder.estimated_delivery,
              shipping_address: fullOrder.shipping_address as {
                fullName?: string
                addressLine1?: string
                addressLine2?: string
                city?: string
                state?: string
                postalCode?: string
                country?: string
              },
              order_items: fullOrder.order_items || [],
            })
          }
        } catch (emailError) {
          console.error('Failed to send shipping notification email:', emailError)
        }
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
