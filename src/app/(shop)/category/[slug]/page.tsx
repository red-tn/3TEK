import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/shop/product-grid'
import { CategoryFilter } from '@/components/shop/category-filter'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: category.name,
    description: category.description || `Browse our ${category.name} collection.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!category) {
    notFound()
  }

  // Fetch products in category
  const { data: products } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  // Fetch all categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link
          href="/"
          className="text-brand-light-gray hover:text-brand-neon transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-brand-gray" />
        <Link
          href="/products"
          className="text-brand-light-gray hover:text-brand-neon transition-colors"
        >
          Products
        </Link>
        <ChevronRight className="h-4 w-4 text-brand-gray" />
        <span className="text-brand-white">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-brand-light-gray max-w-2xl">
            {category.description}
          </p>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <CategoryFilter categories={categories || []} />
      </div>

      {/* Products Grid */}
      <ProductGrid products={products || []} columns={4} />
    </div>
  )
}
