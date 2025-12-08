'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface CategoryFilterProps {
  categories: Category[]
  showAll?: boolean
}

function CategoryFilterContent({ categories, showAll = true }: CategoryFilterProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  return (
    <div className="flex flex-wrap gap-2">
      {showAll && (
        <Link
          href="/products"
          className={cn(
            'px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-colors clip-corners-sm',
            !currentCategory && pathname === '/products'
              ? 'bg-brand-neon text-brand-black border-brand-neon'
              : 'border-brand-gray text-brand-light-gray hover:border-brand-neon hover:text-brand-neon'
          )}
        >
          All
        </Link>
      )}

      {categories.map((category) => {
        const isActive =
          pathname === `/category/${category.slug}` ||
          currentCategory === category.slug

        return (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className={cn(
              'px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-colors clip-corners-sm',
              isActive
                ? 'bg-brand-neon text-brand-black border-brand-neon'
                : 'border-brand-gray text-brand-light-gray hover:border-brand-neon hover:text-brand-neon'
            )}
          >
            {category.name}
          </Link>
        )
      })}
    </div>
  )
}

export function CategoryFilter(props: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="flex flex-wrap gap-2"><div className="h-10 w-20 bg-brand-gray animate-pulse clip-corners-sm" /></div>}>
      <CategoryFilterContent {...props} />
    </Suspense>
  )
}
