import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'
import { ArrowRight, Printer, Zap, Shield, Package } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  return (
    <div className="noise-overlay">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-brand-black grid-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-black/50 to-brand-black" />

        {/* Content */}
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wider mb-6">
              <span className="text-brand-neon text-neon-glow">3</span>
              <span className="text-brand-white">TEK</span>
              <span className="block text-3xl md:text-4xl lg:text-5xl text-brand-light-gray mt-4">
                DESIGN
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-brand-light-gray mb-8 max-w-2xl mx-auto">
              Premium 3D printed products with a cyberpunk industrial vibe.
              Designed and manufactured in the USA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/about">Our Process</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Animated accent lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-neon to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-brand-dark border-y border-brand-gray">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Printer,
                title: 'Precision Printing',
                description: 'High-quality FDM and resin printing with tight tolerances',
              },
              {
                icon: Zap,
                title: 'Fast Turnaround',
                description: 'Most orders ship within 3-5 business days',
              },
              {
                icon: Shield,
                title: 'Quality Guaranteed',
                description: '100% satisfaction guarantee on all products',
              },
              {
                icon: Package,
                title: 'Free Shipping',
                description: 'Free shipping on orders over $75',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 bg-brand-darker border border-brand-gray clip-corners card-hover"
              >
                <feature.icon className="h-10 w-10 text-brand-neon mx-auto mb-4" />
                <h3 className="font-display text-xl text-brand-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-brand-light-gray text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
                Shop by Category
              </h2>
              <p className="text-brand-light-gray max-w-2xl mx-auto">
                Explore our curated collection of 3D printed products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative h-64 bg-brand-darker border border-brand-gray overflow-hidden clip-corners card-hover"
                >
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gray to-brand-dark" />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <h3 className="font-display text-2xl text-brand-white group-hover:text-brand-neon transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-brand-light-gray mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Hover accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-neon transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-20 bg-brand-dark border-y border-brand-gray">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-display text-4xl md:text-5xl text-brand-white mb-2">
                  Featured Products
                </h2>
                <p className="text-brand-light-gray">
                  Our most popular 3D printed creations
                </p>
              </div>
              <Button variant="outline" asChild className="hidden md:flex">
                <Link href="/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Button asChild>
                <Link href="/products">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-brand-darker border border-brand-gray p-12 clip-corners-lg relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-neon via-brand-rust to-brand-neon" />

            <h2 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-brand-light-gray text-lg mb-8 max-w-2xl mx-auto">
              Explore our collection of premium 3D printed products or contact us
              for custom orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
