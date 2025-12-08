import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
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
import { Eye, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Customers | Admin',
}

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('profiles')
    .select('*, orders(count)')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Customers
          </h1>
          <p className="text-brand-light-gray">
            View and manage your customer base.
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
        {customers && customers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-brand-white hover:text-brand-neon transition-colors font-medium"
                      >
                        {customer.full_name || 'No name'}
                      </Link>
                      <p className="text-xs text-brand-light-gray">
                        {customer.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {(customer.orders as { count: number }[])?.[0]?.count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-brand-light-gray">
                      {formatDate(customer.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/customers/${customer.id}`}>
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
            <Users className="h-16 w-16 text-brand-gray mx-auto mb-4" />
            <h2 className="font-display text-xl text-brand-white mb-2">
              No Customers Yet
            </h2>
            <p className="text-brand-light-gray">
              Customers will appear here when they create accounts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
