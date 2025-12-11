import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import type { Metadata } from 'next'

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: 'Order Details',
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch order with items
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  // Fetch status history
  const { data: statusHistory } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  const shippingAddress = order.shipping_address as {
    fullName?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-brand-white mb-1">
              Order #{order.order_number}
            </h1>
            <p className="text-brand-light-gray">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={
                order.status === 'delivered'
                  ? 'success'
                  : order.status === 'shipped'
                  ? 'default'
                  : order.status === 'cancelled' || order.status === 'refunded'
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
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Items
            </h2>
            <div className="divide-y divide-brand-gray">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-20 flex-shrink-0 bg-brand-gray clip-corners-sm overflow-hidden">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-8 w-8 text-brand-light-gray/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-brand-white">
                      {item.product_name}
                    </h3>
                    {item.product_sku && (
                      <p className="font-mono text-xs text-brand-light-gray">
                        SKU: {item.product_sku}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-brand-light-gray">
                        Qty: {item.quantity} × {formatPrice(item.price_cents)}
                      </p>
                      <p className="font-mono text-brand-neon">
                        {formatPrice(item.price_cents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          {order.tracking_number && (
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Tracking
              </h2>
              <div className="flex items-center gap-4">
                <Truck className="h-8 w-8 text-brand-neon" />
                <div>
                  <p className="font-mono text-brand-white">
                    {order.tracking_number}
                  </p>
                  {order.shipping_carrier && (
                    <p className="text-sm text-brand-light-gray">
                      {order.shipping_carrier}
                    </p>
                  )}
                </div>
                {order.tracking_url && (
                  <Button variant="outline" size="sm" asChild className="ml-auto">
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Track Package
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Status History */}
          {statusHistory && statusHistory.length > 0 && (
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Order History
              </h2>
              <div className="space-y-4">
                {statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          index === 0 ? 'bg-brand-neon' : 'bg-brand-gray'
                        }`}
                      />
                      {index < statusHistory.length - 1 && (
                        <div className="flex-1 w-px bg-brand-gray my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-mono text-sm text-brand-white capitalize">
                        {history.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-brand-light-gray">
                        {formatDateTime(history.created_at)}
                      </p>
                      {history.note && (
                        <p className="text-sm text-brand-light-gray mt-1">
                          {history.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-light-gray">Subtotal</span>
                <span className="font-mono text-brand-white">
                  {formatPrice(order.subtotal_cents)}
                </span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between">
                  <span className="text-brand-light-gray">Discount</span>
                  <span className="font-mono text-green-500">
                    -{formatPrice(order.discount_cents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-light-gray">Shipping</span>
                <span className="font-mono text-brand-white">
                  {order.shipping_cents === 0 ? (
                    <span className="text-brand-neon">FREE</span>
                  ) : (
                    formatPrice(order.shipping_cents)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-light-gray">Tax</span>
                <span className="font-mono text-brand-white">
                  {formatPrice(order.tax_cents)}
                </span>
              </div>
              <div className="border-t border-brand-gray pt-3 flex justify-between">
                <span className="font-mono uppercase tracking-wider text-brand-light-gray">
                  Total
                </span>
                <span className="font-mono text-xl text-brand-neon">
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Shipping Address
            </h2>
            <address className="not-italic text-sm text-brand-light-gray space-y-1">
              <p className="text-brand-white">{shippingAddress.fullName}</p>
              <p>{shippingAddress.addressLine1}</p>
              {shippingAddress.addressLine2 && (
                <p>{shippingAddress.addressLine2}</p>
              )}
              <p>
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
            </address>
          </div>

          {/* Need Help */}
          <div className="bg-brand-dark border border-brand-gray p-6 clip-corners">
            <h3 className="font-display text-lg text-brand-white mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-brand-light-gray mb-4">
              Have questions about your order? We&apos;re here to help.
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
