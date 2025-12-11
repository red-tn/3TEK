'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ORDER_STATUSES } from '@/lib/constants'
import { ArrowLeft, Package, Save, Truck, FileText } from 'lucide-react'
import { RefundButton } from '@/components/admin/refund-button'
import { CreateLabelButton } from '@/components/admin/create-label-button'
import type { Order, OrderItem, Profile } from '@/types/database'

type OrderWithRelations = Order & {
  order_items: OrderItem[]
  profile: Profile | null
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [order, setOrder] = useState<OrderWithRelations | null>(null)
  const [statusHistory, setStatusHistory] = useState<{ id: string; status: string; created_at: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    trackingUrl: '',
    shippingCarrier: '',
    adminNotes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), profile:profiles(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      showError('Error', 'Order not found')
      router.push('/admin/orders')
      return
    }

    setOrder(data)
    setFormData({
      status: data.status,
      trackingNumber: data.tracking_number || '',
      trackingUrl: data.tracking_url || '',
      shippingCarrier: data.shipping_carrier || '',
      adminNotes: data.admin_notes || '',
    })

    // Fetch status history
    const { data: history } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', params.id)
      .order('created_at', { ascending: false })

    setStatusHistory(history || [])
    setIsLoading(false)
  }

  const handleSave = async () => {
    if (!order) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/orders?id=${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          trackingNumber: formData.trackingNumber,
          trackingUrl: formData.trackingUrl,
          shippingCarrier: formData.shippingCarrier,
          adminNotes: formData.adminNotes,
        }),
      })

      if (!response.ok) throw new Error('Failed to update order')

      success('Order updated', 'The order has been updated successfully.')
      fetchOrder()
    } catch (err) {
      console.error('Update error:', err)
      showError('Error', 'Failed to update order.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !order) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-brand-gray animate-pulse" />
        <div className="h-96 bg-brand-darker border border-brand-gray animate-pulse" />
      </div>
    )
  }

  const shippingAddress = order.shipping_address as {
    fullName?: string
    email?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-brand-white mb-1">
              Order #{order.order_number}
            </h1>
            <p className="text-brand-light-gray">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-4">
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
            <RefundButton
              orderId={order.id}
              orderNumber={order.order_number}
              totalCents={order.total_cents}
              paymentStatus={order.payment_status}
              onRefundComplete={fetchOrder}
            />
            <CreateLabelButton
              orderId={order.id}
              orderNumber={order.order_number}
              hasTrackingNumber={!!order.tracking_number}
              onLabelCreated={fetchOrder}
            />
            <Button
              variant="outline"
              onClick={() => window.open(`/api/admin/orders/invoice?orderId=${order.id}`, '_blank')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Items ({order.order_items.length})
            </h2>
            <div className="divide-y divide-brand-gray">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 flex-shrink-0 bg-brand-gray clip-corners-sm overflow-hidden">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-brand-light-gray/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-brand-white font-medium">
                      {item.product_name}
                    </p>
                    {item.product_sku && (
                      <p className="font-mono text-xs text-brand-light-gray">
                        SKU: {item.product_sku}
                      </p>
                    )}
                    <p className="text-sm text-brand-light-gray mt-1">
                      Qty: {item.quantity} × {formatPrice(item.price_cents)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-brand-neon">
                      {formatPrice(item.price_cents * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t border-brand-gray mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-light-gray">Subtotal</span>
                <span className="font-mono text-brand-white">
                  {formatPrice(order.subtotal_cents)}
                </span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-light-gray">Discount</span>
                  <span className="font-mono text-green-500">
                    -{formatPrice(order.discount_cents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-light-gray">Shipping</span>
                <span className="font-mono text-brand-white">
                  {order.shipping_cents === 0 ? 'FREE' : formatPrice(order.shipping_cents)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-light-gray">Tax</span>
                <span className="font-mono text-brand-white">
                  {formatPrice(order.tax_cents)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-brand-gray">
                <span className="font-mono uppercase tracking-wider text-brand-light-gray">
                  Total
                </span>
                <span className="font-mono text-xl text-brand-neon">
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {/* Update Order */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Update Order
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Order Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Shipping Carrier</Label>
                  <Input
                    value={formData.shippingCarrier}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingCarrier: e.target.value })
                    }
                    placeholder="e.g., USPS, UPS, FedEx"
                  />
                </div>
                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    value={formData.trackingNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, trackingNumber: e.target.value })
                    }
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>

              <div>
                <Label>Tracking URL</Label>
                <Input
                  value={formData.trackingUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, trackingUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={formData.adminNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, adminNotes: e.target.value })
                  }
                  placeholder="Internal notes (not visible to customer)"
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} isLoading={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Customer
            </h2>
            <div className="space-y-2">
              <p className="text-brand-white">
                {order.profile?.full_name || shippingAddress.fullName || 'Guest'}
              </p>
              <p className="text-sm text-brand-light-gray">
                {order.profile?.email || order.guest_email}
              </p>
              {order.profile && (
                <Button variant="outline" size="sm" asChild className="mt-2">
                  <Link href={`/admin/customers/${order.profile.id}`}>
                    View Customer
                  </Link>
                </Button>
              )}
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
              {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
              <p>
                {shippingAddress.city}, {shippingAddress.state}{' '}
                {shippingAddress.postalCode}
              </p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
            </address>
          </div>

          {/* Status History */}
          {statusHistory.length > 0 && (
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Status History
              </h2>
              <div className="space-y-3">
                {statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          index === 0 ? 'bg-brand-neon' : 'bg-brand-gray'
                        }`}
                      />
                      {index < statusHistory.length - 1 && (
                        <div className="flex-1 w-px bg-brand-gray my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="font-mono text-xs text-brand-white capitalize">
                        {history.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-brand-light-gray">
                        {formatDateTime(history.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
