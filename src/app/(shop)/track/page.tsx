'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const trackSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Valid email required'),
})

type TrackInput = z.infer<typeof trackSchema>

interface OrderStatus {
  order_number: string
  status: string
  created_at: string
  shipped_at?: string
  delivered_at?: string
  tracking_number?: string
  tracking_url?: string
  items: Array<{
    product_name: string
    quantity: number
  }>
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

function getStatusIndex(status: string): number {
  const statusMap: Record<string, number> = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
  }
  return statusMap[status] ?? 0
}

export default function TrackOrderPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackInput>({
    resolver: zodResolver(trackSchema),
  })

  const onSubmit = async (data: TrackInput) => {
    setIsLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.email)}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your order number and email.')
        }
        throw new Error('Failed to fetch order')
      }

      const orderData = await response.json()
      setOrder(orderData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const currentStep = order ? getStatusIndex(order.status) : 0

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Track Your Order
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          Enter your order number and email to check the status of your order.
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="e.g., 3TEK-ABC123"
                {...register('orderNumber')}
                error={errors.orderNumber?.message}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="The email used for your order"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-red-500/10 border border-red-500/30 p-4 clip-corners text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Order Status */}
      {order && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-gray">
              <div>
                <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-1">
                  Order Number
                </div>
                <div className="font-display text-2xl text-brand-white">
                  {order.order_number}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-1">
                  Order Date
                </div>
                <div className="text-brand-white">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-brand-gray">
                  <div
                    className="h-full bg-brand-neon transition-all duration-500"
                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = index <= currentStep
                    const isCurrent = index === currentStep

                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                            isCompleted
                              ? 'bg-brand-neon border-brand-neon'
                              : 'bg-brand-darker border-brand-gray',
                            isCurrent && 'ring-4 ring-brand-neon/30'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-5 w-5',
                              isCompleted ? 'text-brand-black' : 'text-brand-light-gray'
                            )}
                          />
                        </div>
                        <div
                          className={cn(
                            'mt-3 font-mono text-xs uppercase tracking-wider text-center',
                            isCompleted ? 'text-brand-neon' : 'text-brand-light-gray'
                          )}
                        >
                          {step.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="mb-8 p-4 bg-brand-dark border border-brand-gray clip-corners-sm">
                <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-2">
                  Tracking Number
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-brand-white">{order.tracking_number}</span>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-neon hover:underline text-sm"
                    >
                      Track with carrier →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-4">
                Items in Order
              </div>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-brand-gray last:border-0"
                  >
                    <span className="text-brand-white">{item.product_name}</span>
                    <span className="text-brand-light-gray">Qty: {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="mt-8 pt-6 border-t border-brand-gray grid sm:grid-cols-2 gap-4 text-sm">
              {order.shipped_at && (
                <div>
                  <span className="text-brand-light-gray">Shipped: </span>
                  <span className="text-brand-white">
                    {new Date(order.shipped_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {order.delivered_at && (
                <div>
                  <span className="text-brand-light-gray">Delivered: </span>
                  <span className="text-brand-white">
                    {new Date(order.delivered_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Help */}
          <div className="mt-6 text-center text-brand-light-gray text-sm">
            Questions about your order?{' '}
            <a href="/contact" className="text-brand-neon hover:underline">
              Contact us
            </a>
          </div>
        </div>
      )}

      {/* No Order Yet - Help Text */}
      {!order && !error && (
        <div className="max-w-xl mx-auto text-center">
          <p className="text-brand-light-gray text-sm">
            Your order number can be found in your confirmation email.
            If you have an account, you can also view all your orders in your{' '}
            <a href="/account/orders" className="text-brand-neon hover:underline">
              account dashboard
            </a>
            .
          </p>
        </div>
      )}
    </div>
  )
}
