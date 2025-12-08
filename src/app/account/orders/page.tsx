import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders',
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-3xl text-brand-white mb-8">My Orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-brand-darker border border-brand-gray p-6 clip-corners"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-mono text-lg text-brand-neon">
                      #{order.order_number}
                    </h3>
                    <Badge
                      variant={
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'shipped'
                          ? 'default'
                          : order.status === 'cancelled' ||
                            order.status === 'refunded'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant={
                        order.payment_status === 'paid'
                          ? 'success'
                          : order.payment_status === 'failed'
                          ? 'destructive'
                          : 'warning'
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-brand-light-gray">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl text-brand-white">
                    {formatPrice(order.total_cents)}
                  </p>
                  <p className="text-sm text-brand-light-gray">
                    {order.order_items?.length || 0}{' '}
                    {order.order_items?.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              {/* Tracking Info */}
              {order.tracking_number && (
                <div className="py-3 px-4 bg-brand-dark border border-brand-gray clip-corners-sm mb-4">
                  <p className="text-sm text-brand-light-gray">
                    Tracking:{' '}
                    {order.tracking_url ? (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-neon hover:underline font-mono"
                      >
                        {order.tracking_number}
                      </a>
                    ) : (
                      <span className="font-mono text-brand-white">
                        {order.tracking_number}
                      </span>
                    )}
                    {order.shipping_carrier && (
                      <span className="text-brand-light-gray">
                        {' '}
                        via {order.shipping_carrier}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <Button variant="outline" size="sm" asChild>
                <Link href={`/account/orders/${order.id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-darker border border-brand-gray clip-corners">
          <Package className="h-16 w-16 text-brand-gray mx-auto mb-4" />
          <h2 className="font-display text-xl text-brand-white mb-2">
            No Orders Yet
          </h2>
          <p className="text-brand-light-gray mb-6">
            You haven&apos;t placed any orders yet. Start shopping to see your
            orders here.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
