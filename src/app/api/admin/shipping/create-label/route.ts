import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createFedExShipment, isFedExConfigured } from '@/lib/fedex'

const STORE_ORIGIN = {
  streetLines: [process.env.STORE_ADDRESS_LINE1 || '123 Main St'],
  city: process.env.STORE_CITY || 'Austin',
  stateOrProvinceCode: process.env.STORE_STATE || 'TX',
  postalCode: process.env.STORE_POSTAL_CODE || '78701',
  countryCode: 'US',
  contact: {
    personName: process.env.STORE_CONTACT_NAME || '3TEK Design',
    phoneNumber: process.env.STORE_PHONE || '5125551234',
    companyName: '3TEK Design',
  },
}

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

    // Check if FedEx is configured
    if (!isFedExConfigured()) {
      return NextResponse.json(
        { error: 'FedEx integration not configured' },
        { status: 503 }
      )
    }

    const { orderId, serviceType, parcels } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if label already exists
    if (order.tracking_number) {
      return NextResponse.json(
        { error: 'Shipping label already created for this order' },
        { status: 400 }
      )
    }

    const shippingAddress = order.shipping_address as {
      fullName?: string
      addressLine1?: string
      addressLine2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
      phone?: string
      email?: string
    }

    // Build destination
    const destination = {
      streetLines: [
        shippingAddress.addressLine1 || '',
        shippingAddress.addressLine2 || '',
      ].filter(Boolean) as string[],
      city: shippingAddress.city || '',
      stateOrProvinceCode: shippingAddress.state || '',
      postalCode: shippingAddress.postalCode || '',
      countryCode: shippingAddress.country || 'US',
      residential: true,
      contact: {
        personName: shippingAddress.fullName || 'Customer',
        phoneNumber: shippingAddress.phone || '0000000000',
        emailAddress: order.email,
      },
    }

    // Default parcels if not provided
    const defaultParcels = parcels || [
      {
        weight: { value: 1, units: 'LB' as const },
        dimensions: { length: 10, width: 8, height: 4, units: 'IN' as const },
      },
    ]

    // Create shipment
    const shipment = await createFedExShipment(
      STORE_ORIGIN,
      destination,
      defaultParcels,
      serviceType || 'FEDEX_GROUND'
    )

    // Update order with tracking info
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: shipment.trackingNumber,
        tracking_url: shipment.trackingUrl,
        shipping_carrier: 'FedEx',
        status: 'ready_to_ship',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
    }

    // Add to status history
    await supabaseAdmin.from('order_status_history').insert({
      order_id: orderId,
      status: 'ready_to_ship',
      note: `FedEx shipping label created. Tracking: ${shipment.trackingNumber}`,
      changed_by: user.id,
    })

    return NextResponse.json({
      success: true,
      trackingNumber: shipment.trackingNumber,
      trackingUrl: shipment.trackingUrl,
      labelData: shipment.labelData,
    })
  } catch (error) {
    console.error('Create label error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create shipping label'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
