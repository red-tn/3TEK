'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Eye, Mail, MapPin, Calendar, ShoppingBag } from 'lucide-react'
import type { Profile, Order, Address } from '@/types/database'

type CustomerWithOrders = Profile & {
  orders: Order[]
  addresses: Address[]
}

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { error: showError } = useToast()
  const [customer, setCustomer] = useState<CustomerWithOrders | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchCustomer()
  }, [params.id])

  const fetchCustomer = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, orders(*), addresses(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      showError('Error', 'Customer not found')
      router.push('/admin/customers')
      return
    }

    setCustomer(data as CustomerWithOrders)
    setIsLoading(false)
  }

  if (isLoading || !customer) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-brand-gray animate-pulse" />
        <div className="h-96 bg-brand-darker border border-brand-gray animate-pulse" />
      </div>
    )
  }

  const totalSpent = customer.orders?.reduce((sum, order) => sum + (order.total_cents || 0), 0) || 0
  const orderCount = customer.orders?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-brand-white mb-1">
              {customer.full_name || 'No Name'}
            </h1>
            <p className="text-brand-light-gray">{customer.email}</p>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-brand-darker border border-brand-gray p-4 clip-corners">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-brand-neon" />
                <div>
                  <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                    Total Orders
                  </p>
                  <p className="font-display text-2xl text-brand-white">
                    {orderCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-brand-darker border border-brand-gray p-4 clip-corners">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 flex items-center justify-center text-brand-neon font-mono text-xl">
                  $
                </div>
                <div>
                  <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                    Total Spent
                  </p>
                  <p className="font-display text-2xl text-brand-neon">
                    {formatPrice(totalSpent)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-brand-darker border border-brand-gray p-4 clip-corners">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-brand-white" />
                <div>
                  <p className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                    Customer Since
                  </p>
                  <p className="font-display text-lg text-brand-white">
                    {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Order History
            </h2>
            {customer.orders && customer.orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.orders
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono text-brand-neon hover:underline"
                          >
                            #{order.order_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-brand-light-gray">
                            {formatDate(order.created_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">
                            {formatPrice(order.total_cents)}
                          </span>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-brand-light-gray text-center py-8">
                No orders yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Info */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-brand-light-gray mt-0.5" />
                <div>
                  <p className="text-xs text-brand-light-gray uppercase tracking-wider">
                    Email
                  </p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-brand-neon hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
              {customer.phone && (
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 text-brand-light-gray mt-0.5">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-brand-light-gray uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="text-brand-white">{customer.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Saved Addresses
            </h2>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-4">
                {customer.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-3 bg-brand-dark border border-brand-gray clip-corners-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-brand-light-gray mt-0.5" />
                        <address className="not-italic text-sm text-brand-light-gray">
                          <p className="text-brand-white font-medium">
                            {address.full_name}
                          </p>
                          <p>{address.address_line1}</p>
                          {address.address_line2 && <p>{address.address_line2}</p>}
                          <p>
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p>{address.country}</p>
                        </address>
                      </div>
                      {address.is_default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-brand-light-gray text-sm">
                No saved addresses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
