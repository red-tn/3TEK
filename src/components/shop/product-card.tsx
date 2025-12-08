import Image from 'next/image'
import Link from 'next/link'
import { cn, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from './add-to-cart-button'

interface ProductCardProduct {
  id: string
  name: string
  slug: string
  price_cents: number
  compare_at_price_cents?: number | null
  images?: Array<{ url: string; alt?: string; is_primary?: boolean }> | null
  badge?: string | null
  category?: { name: string } | null
}

interface ProductCardProps {
  product: ProductCardProduct
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]

  return (
    <article
      className={cn(
        'group relative bg-brand-darker border border-brand-gray overflow-hidden transition-all duration-300 hover:border-brand-neon hover:-translate-y-1 clip-corners',
        className
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-neon to-brand-rust transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-10" />

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative h-64 bg-brand-gray"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-brand-light-gray/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
        )}

        {product.badge && (
          <Badge className="absolute top-3 right-3 z-10">{product.badge}</Badge>
        )}

        {product.compare_at_price_cents &&
          product.compare_at_price_cents > product.price_cents && (
            <Badge variant="rust" className="absolute top-3 left-3 z-10">
              Sale
            </Badge>
          )}
      </Link>

      {/* Info */}
      <div className="p-5">
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="font-mono text-xs text-brand-rust uppercase tracking-wider hover:text-brand-rust/80 transition-colors"
          >
            {product.category.name}
          </Link>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-xl mt-1 tracking-wide text-brand-white hover:text-brand-neon transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-brand-light-gray mt-1 line-clamp-2">
            {product.short_description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg text-brand-neon">
              {formatPrice(product.price_cents)}
            </span>
            {product.compare_at_price_cents &&
              product.compare_at_price_cents > product.price_cents && (
                <span className="font-mono text-sm text-brand-light-gray line-through">
                  {formatPrice(product.compare_at_price_cents)}
                </span>
              )}
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price_cents,
              image: primaryImage?.url,
              sku: product.sku ?? undefined,
            }}
            size="sm"
          />
        </div>
      </div>
    </article>
  )
}
