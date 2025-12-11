import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
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
import { Plus, Edit, Package } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | Admin',
}

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Products
          </h1>
          <p className="text-brand-light-gray">
            Manage your product catalog.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
        {products && products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                // Handle both string array and object array formats
                const firstImage = product.images?.[0]
                const primaryImageUrl = firstImage
                  ? (typeof firstImage === 'string' ? firstImage : firstImage.url)
                  : null

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 bg-brand-gray clip-corners-sm overflow-hidden">
                          {primaryImageUrl ? (
                            <Image
                              src={primaryImageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-5 w-5 text-brand-light-gray/50" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-brand-white hover:text-brand-neon transition-colors font-medium"
                          >
                            {product.name}
                          </Link>
                          {product.sku && (
                            <p className="font-mono text-xs text-brand-light-gray">
                              {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-brand-light-gray">
                        {(product.category as { name?: string })?.name || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-mono text-brand-neon">
                          {formatPrice(product.price_cents)}
                        </span>
                        {product.compare_at_price_cents &&
                          product.compare_at_price_cents > product.price_cents && (
                            <span className="font-mono text-xs text-brand-light-gray line-through ml-2">
                              {formatPrice(product.compare_at_price_cents)}
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.track_inventory ? (
                        <Badge
                          variant={
                            product.stock_quantity === 0
                              ? 'destructive'
                              : product.stock_quantity <= 5
                              ? 'warning'
                              : 'secondary'
                          }
                        >
                          {product.stock_quantity}
                        </Badge>
                      ) : (
                        <span className="text-brand-light-gray">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={product.is_active ? 'success' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.is_featured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                        {product.badge && (
                          <Badge variant="rust">{product.badge}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-brand-gray mx-auto mb-4" />
            <h2 className="font-display text-xl text-brand-white mb-2">
              No Products Yet
            </h2>
            <p className="text-brand-light-gray mb-6">
              Start by adding your first product.
            </p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
