import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/shop/product-grid'
import { CategoryFilter } from '@/components/shop/category-filter'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our complete collection of premium 3D printed products.',
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    page?: string
  }>
}

async function ProductsList({ searchParams }: { searchParams: ProductsPageProps['searchParams'] }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)

  // Filter by category
  if (params.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()

    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  // Sort
  switch (params.sort) {
    case 'price-asc':
      query = query.order('price_cents', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price_cents', { ascending: false })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query

  return <ProductGrid products={products || []} columns={4} />
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-brand-darker border border-brand-gray clip-corners">
          <Skeleton className="h-64 w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          All Products
        </h1>
        <p className="text-brand-light-gray">
          Browse our complete collection of premium 3D printed products.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <CategoryFilter categories={categories || []} />

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
            Sort by:
          </span>
          <select
            className="bg-brand-darker border border-brand-gray px-3 py-2 font-mono text-sm text-brand-white focus:outline-none focus:border-brand-neon"
            defaultValue={params.sort || 'newest'}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <Suspense fallback={<ProductsLoading />}>
        <ProductsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
