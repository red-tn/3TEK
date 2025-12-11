import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGallery } from '@/components/shop/product-gallery'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { ProductCard } from '@/components/shop/product-card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, Truck, Shield, Clock, Package } from 'lucide-react'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, meta_title, meta_description, images')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  // Handle both string array and object array for images
  const firstImage = product.images?.[0]
  const primaryImageUrl = firstImage
    ? (typeof firstImage === 'string' ? firstImage : firstImage.url)
    : null

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description,
    openGraph: {
      title: product.meta_title || product.name,
      description: product.meta_description || product.short_description || undefined,
      images: primaryImageUrl ? [primaryImageUrl] : undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4)

  // Handle both string array and object array for images
  const firstImage = product.images?.[0]
  const primaryImageUrl = firstImage
    ? (typeof firstImage === 'string' ? firstImage : firstImage.url)
    : null
  const isOnSale =
    product.compare_at_price_cents &&
    product.compare_at_price_cents > product.price_cents
  const inStock = !product.track_inventory || product.stock_quantity > 0

  return (
    <div className="container mx-auto px-4 py-8">
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
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4 text-brand-gray" />
            <Link
              href={`/category/${product.category.slug}`}
              className="text-brand-light-gray hover:text-brand-neon transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 text-brand-gray" />
        <span className="text-brand-white">{product.name}</span>
      </nav>

      {/* Product Details */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <ProductGallery images={product.images || []} productName={product.name} />

        {/* Info */}
        <div>
          {/* Category & Badge */}
          <div className="flex items-center gap-3 mb-4">
            {product.category && (
              <Link
                href={`/category/${product.category.slug}`}
                className="font-mono text-xs text-brand-rust uppercase tracking-wider hover:text-brand-rust/80 transition-colors"
              >
                {product.category.name}
              </Link>
            )}
            {product.badge && <Badge>{product.badge}</Badge>}
            {isOnSale && <Badge variant="rust">Sale</Badge>}
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-3xl text-brand-neon">
              {formatPrice(product.price_cents)}
            </span>
            {isOnSale && (
              <span className="font-mono text-xl text-brand-light-gray line-through">
                {formatPrice(product.compare_at_price_cents!)}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-brand-light-gray text-lg mb-6">
              {product.short_description}
            </p>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {inStock ? (
              <span className="inline-flex items-center gap-2 text-green-500 font-mono text-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                In Stock
                {product.track_inventory && product.stock_quantity <= 5 && (
                  <span className="text-brand-rust">
                    (Only {product.stock_quantity} left)
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-500 font-mono text-sm">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <div className="mb-8">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price_cents,
                image: primaryImageUrl ?? undefined,
                sku: product.sku ?? undefined,
              }}
              size="lg"
              showText
              className="w-full md:w-auto"
            />
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 py-6 border-t border-brand-gray">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-brand-neon" />
              <div>
                <p className="text-sm text-brand-white">Free Shipping</p>
                <p className="text-xs text-brand-light-gray">Orders over $75</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-brand-neon" />
              <div>
                <p className="text-sm text-brand-white">Quality Guarantee</p>
                <p className="text-xs text-brand-light-gray">100% satisfaction</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-brand-neon" />
              <div>
                <p className="text-sm text-brand-white">Fast Turnaround</p>
                <p className="text-xs text-brand-light-gray">3-5 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-brand-neon" />
              <div>
                <p className="text-sm text-brand-white">Secure Packaging</p>
                <p className="text-xs text-brand-light-gray">Protected delivery</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="py-6 border-t border-brand-gray">
            <h3 className="font-display text-xl text-brand-white mb-4">
              Product Details
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {product.sku && (
                <>
                  <dt className="text-brand-light-gray">SKU</dt>
                  <dd className="font-mono text-brand-white">{product.sku}</dd>
                </>
              )}
              {product.material && (
                <>
                  <dt className="text-brand-light-gray">Material</dt>
                  <dd className="font-mono text-brand-white">{product.material}</dd>
                </>
              )}
              {product.color && (
                <>
                  <dt className="text-brand-light-gray">Color</dt>
                  <dd className="font-mono text-brand-white">{product.color}</dd>
                </>
              )}
              {product.weight_oz && (
                <>
                  <dt className="text-brand-light-gray">Weight</dt>
                  <dd className="font-mono text-brand-white">
                    {product.weight_oz} oz
                  </dd>
                </>
              )}
              {product.print_time_hours && (
                <>
                  <dt className="text-brand-light-gray">Print Time</dt>
                  <dd className="font-mono text-brand-white">
                    ~{product.print_time_hours} hours
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="max-w-3xl mb-16">
          <h2 className="font-display text-2xl text-brand-white mb-4">
            About This Product
          </h2>
          <div className="prose prose-invert prose-brand max-w-none">
            <p className="text-brand-light-gray whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-brand-gray">
          <h2 className="font-display text-3xl text-brand-white mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
