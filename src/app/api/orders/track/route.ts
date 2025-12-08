import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const email = searchParams.get('email')

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        order_number,
        status,
        created_at,
        shipped_at,
        delivered_at,
        tracking_number,
        tracking_url,
        order_items (
          product_name,
          quantity
        )
      `)
      .eq('order_number', orderNumber)
      .eq('email', email.toLowerCase())
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      order_number: order.order_number,
      status: order.status,
      created_at: order.created_at,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      tracking_number: order.tracking_number,
      tracking_url: order.tracking_url,
      items: order.order_items,
    })
  } catch (error) {
    console.error('Track order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
