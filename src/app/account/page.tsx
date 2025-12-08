import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, MapPin, Settings, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
}

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Fetch address count
  const { count: addressCount } = await supabase
    .from('addresses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        <p className="text-brand-light-gray">
          Manage your orders, addresses, and account settings.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-brand-darker border border-brand-gray p-6 clip-corners hover:border-brand-neon transition-colors group"
        >
          <Package className="h-8 w-8 text-brand-neon mb-4" />
          <h3 className="font-display text-xl text-brand-white mb-1">Orders</h3>
          <p className="text-brand-light-gray text-sm">
            View order history and track shipments
          </p>
          <ArrowRight className="h-4 w-4 text-brand-light-gray group-hover:text-brand-neon group-hover:translate-x-1 transition-all mt-4" />
        </Link>

        <Link
          href="/account/addresses"
          className="bg-brand-darker border border-brand-gray p-6 clip-corners hover:border-brand-neon transition-colors group"
        >
          <MapPin className="h-8 w-8 text-brand-neon mb-4" />
          <h3 className="font-display text-xl text-brand-white mb-1">
            Addresses
          </h3>
          <p className="text-brand-light-gray text-sm">
            {addressCount || 0} saved {addressCount === 1 ? 'address' : 'addresses'}
          </p>
          <ArrowRight className="h-4 w-4 text-brand-light-gray group-hover:text-brand-neon group-hover:translate-x-1 transition-all mt-4" />
        </Link>

        <Link
          href="/account/settings"
          className="bg-brand-darker border border-brand-gray p-6 clip-corners hover:border-brand-neon transition-colors group"
        >
          <Settings className="h-8 w-8 text-brand-neon mb-4" />
          <h3 className="font-display text-xl text-brand-white mb-1">
            Settings
          </h3>
          <p className="text-brand-light-gray text-sm">
            Update your profile and preferences
          </p>
          <ArrowRight className="h-4 w-4 text-brand-light-gray group-hover:text-brand-neon group-hover:translate-x-1 transition-all mt-4" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-brand-white">
            Recent Orders
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders">View All</Link>
          </Button>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 bg-brand-dark border border-brand-gray hover:border-brand-neon transition-colors clip-corners-sm"
              >
                <div>
                  <p className="font-mono text-sm text-brand-neon">
                    #{order.order_number}
                  </p>
                  <p className="text-sm text-brand-light-gray">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-brand-white">
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
                    className="mt-1"
                  >
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-brand-gray mx-auto mb-4" />
            <p className="text-brand-light-gray mb-4">
              You haven&apos;t placed any orders yet.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
