import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Package } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders | Admin',
}

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('orders')
    .select('*, profile:profiles(email, full_name), order_items(*)', { count: 'exact' })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: orders, count } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Orders
          </h1>
          <p className="text-brand-light-gray">
            Manage and track all customer orders.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'processing', label: 'Processing' },
          { value: 'printing', label: 'Printing' },
          { value: 'shipped', label: 'Shipped' },
          { value: 'delivered', label: 'Delivered' },
        ].map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/orders${filter.value ? `?status=${filter.value}` : ''}`}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-colors clip-corners-sm ${
              (params.status || '') === filter.value
                ? 'bg-brand-neon text-brand-black border-brand-neon'
                : 'border-brand-gray text-brand-light-gray hover:border-brand-neon hover:text-brand-neon'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
        {orders && orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
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
                    <div>
                      <p className="text-brand-white">
                        {(order.profile as { full_name?: string })?.full_name ||
                          'Guest'}
                      </p>
                      <p className="text-xs text-brand-light-gray">
                        {(order.profile as { email?: string })?.email ||
                          order.guest_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {order.order_items?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">
                      {formatPrice(order.total_cents)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
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
                        className="text-xs"
                      >
                        {order.payment_status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-brand-light-gray">
                      {formatDate(order.created_at)}
                    </span>
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
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-brand-gray mx-auto mb-4" />
            <h2 className="font-display text-xl text-brand-white mb-2">
              No Orders Found
            </h2>
            <p className="text-brand-light-gray">
              {params.status
                ? `No orders with status "${params.status}".`
                : 'Orders will appear here when customers make purchases.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination info */}
      {count && count > 0 && (
        <p className="text-sm text-brand-light-gray">
          Showing {orders?.length || 0} of {count} orders
        </p>
      )}
    </div>
  )
}
