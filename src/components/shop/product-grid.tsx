import { ProductCard } from './product-card'
import type { Product, Category } from '@/types/database'

interface ProductGridProps {
  products: (Product & { category?: Category | null })[]
  columns?: 2 | 3 | 4
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-brand-gray"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <h3 className="mt-4 font-display text-xl text-brand-white">
          No products found
        </h3>
        <p className="mt-2 text-brand-light-gray">
          Check back soon for new items!
        </p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 gap-6 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
