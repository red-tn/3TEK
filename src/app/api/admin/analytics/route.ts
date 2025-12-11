import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
    const range = searchParams.get('range') || '30' // days

    const daysAgo = parseInt(range)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    const startDateStr = startDate.toISOString()

    // Get order stats for the period
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, total_cents, status, payment_status, created_at')
      .gte('created_at', startDateStr)

    if (ordersError) throw ordersError

    // Calculate summary stats
    const totalOrders = orders?.length || 0
    const paidOrders = orders?.filter((o) => o.payment_status === 'paid') || []
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_cents, 0)
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

    // Group orders by status
    const ordersByStatus = (orders || []).reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get daily revenue for chart
    const dailyRevenue: Record<string, number> = {}
    const dailyOrders: Record<string, number> = {}

    for (const order of paidOrders) {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.total_cents
      dailyOrders[date] = (dailyOrders[date] || 0) + 1
    }

    // Convert to array sorted by date
    const revenueChart = Object.entries(dailyRevenue)
      .map(([date, amount]) => ({
        date,
        revenue: amount,
        orders: dailyOrders[date] || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Get top products by revenue
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('product_name, price_cents, quantity, order:orders!inner(payment_status, created_at)')
      .gte('order.created_at', startDateStr)
      .eq('order.payment_status', 'paid')

    if (itemsError) throw itemsError

    const productSales: Record<string, { name: string; revenue: number; quantity: number }> = {}
    for (const item of orderItems || []) {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = {
          name: item.product_name,
          revenue: 0,
          quantity: 0,
        }
      }
      productSales[item.product_name].revenue += item.price_cents * item.quantity
      productSales[item.product_name].quantity += item.quantity
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Get new customers count
    const { count: newCustomers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr)

    // Get total product count and low stock count
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, stock_quantity, track_inventory')

    const totalProducts = products?.length || 0
    const lowStockProducts = products?.filter(
      (p) => p.track_inventory && p.stock_quantity <= 5
    ).length || 0

    return NextResponse.json({
      summary: {
        totalOrders,
        paidOrders: paidOrders.length,
        totalRevenue,
        avgOrderValue: Math.round(avgOrderValue),
        newCustomers: newCustomers || 0,
        totalProducts,
        lowStockProducts,
      },
      ordersByStatus,
      revenueChart,
      topProducts,
      period: {
        start: startDateStr,
        end: new Date().toISOString(),
        days: daysAgo,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
