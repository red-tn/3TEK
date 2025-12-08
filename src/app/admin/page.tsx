import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard stats
  const [ordersResult, productsResult, customersResult] = await Promise.all([
    supabase.from('orders').select('total_cents, status, created_at'),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ])

  const orders = ordersResult.data || []
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_cents || 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(
    (o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)
  ).length
  const totalProducts = productsResult.count || 0
  const totalCustomers = customersResult.count || 0

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profile:profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch low stock products
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, stock_quantity')
    .eq('is_active', true)
    .eq('track_inventory', true)
    .lte('stock_quantity', 5)
    .order('stock_quantity')
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Dashboard
        </h1>
        <p className="text-brand-light-gray">
          Welcome to your 3TEK Design admin dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="font-display text-3xl text-brand-neon mt-1">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-brand-neon" />
          </div>
        </div>

        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Total Orders
              </p>
              <p className="font-display text-3xl text-brand-neon mt-1">
                {totalOrders}
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-brand-neon" />
          </div>
        </div>

        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Pending Orders
              </p>
              <p className="font-display text-3xl text-brand-rust mt-1">
                {pendingOrders}
              </p>
            </div>
            <Package className="h-8 w-8 text-brand-rust" />
          </div>
        </div>

        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Customers
              </p>
              <p className="font-display text-3xl text-brand-white mt-1">
                {totalCustomers}
              </p>
            </div>
            <Users className="h-8 w-8 text-brand-white" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-brand-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-brand-neon text-sm hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-3 bg-brand-dark border border-brand-gray hover:border-brand-neon transition-colors clip-corners-sm"
                >
                  <div>
                    <p className="font-mono text-sm text-brand-neon">
                      #{order.order_number}
                    </p>
                    <p className="text-xs text-brand-light-gray">
                      {(order.profile as { full_name?: string })?.full_name ||
                        order.guest_email ||
                        'Guest'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-brand-white">
                      {formatPrice(order.total_cents)}
                    </p>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'shipped'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-brand-light-gray text-center py-8">
              No orders yet.
            </p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-brand-white">
              Low Stock Alert
            </h2>
            <Link
              href="/admin/products"
              className="text-brand-neon text-sm hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between p-3 bg-brand-dark border border-brand-gray hover:border-brand-rust transition-colors clip-corners-sm"
                >
                  <p className="text-brand-white">{product.name}</p>
                  <Badge
                    variant={product.stock_quantity === 0 ? 'destructive' : 'warning'}
                  >
                    {product.stock_quantity} left
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-brand-light-gray text-center py-8">
              All products are well stocked!
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
        <h2 className="font-display text-xl text-brand-white mb-6">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
              Products
            </p>
            <p className="font-display text-2xl text-brand-white mt-1">
              {totalProducts}
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
              Avg Order Value
            </p>
            <p className="font-display text-2xl text-brand-white mt-1">
              {totalOrders > 0
                ? formatPrice(totalRevenue / totalOrders)
                : '$0.00'}
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
              Conversion Rate
            </p>
            <p className="font-display text-2xl text-brand-white mt-1">--</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
              Repeat Customers
            </p>
            <p className="font-display text-2xl text-brand-white mt-1">--</p>
          </div>
        </div>
      </div>
    </div>
  )
}
