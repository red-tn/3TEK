import Image from 'next/image'
import Link from 'next/link'
import { Zap, Heart, Recycle, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about 3TEK Design - our mission, values, and the team behind premium 3D printed products.',
}

const values = [
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We push the boundaries of what\'s possible with 3D printing technology, constantly exploring new materials and techniques.',
  },
  {
    icon: Heart,
    title: 'Craftsmanship',
    description: 'Every product is designed with care and printed with precision. We don\'t ship anything we wouldn\'t proudly display ourselves.',
  },
  {
    icon: Recycle,
    title: 'Sustainability',
    description: 'We use eco-friendly materials and minimize waste through on-demand manufacturing. Print what you need, nothing more.',
  },
  {
    icon: Award,
    title: 'Quality',
    description: 'From material selection to final inspection, quality control is embedded in every step of our process.',
  },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="font-display text-4xl md:text-6xl text-brand-white mb-6">
          The Future of<br />
          <span className="text-brand-neon">Manufacturing</span>
        </h1>
        <p className="text-brand-light-gray text-lg max-w-2xl mx-auto">
          3TEK Design was born from a simple idea: combine cutting-edge 3D printing technology
          with bold, industrial aesthetics to create products that are as functional as they are beautiful.
        </p>
      </section>

      {/* Story Section */}
      <section className="grid lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <div className="font-mono text-sm text-brand-neon uppercase tracking-wider mb-4">
            Our Story
          </div>
          <h2 className="font-display text-3xl text-brand-white mb-6">
            From Garage to Global
          </h2>
          <div className="space-y-4 text-brand-light-gray">
            <p>
              It started in 2020 with a single 3D printer in a garage in Austin, Texas.
              What began as a hobby quickly evolved into a passion project, and then into 3TEK Design.
            </p>
            <p>
              We noticed something missing in the market: 3D printed products that didn't look like
              they came from a 3D printer. We wanted to create pieces with the precision of modern
              manufacturing but the soul of handcrafted goods.
            </p>
            <p>
              Today, we operate a full production facility with over 20 industrial-grade printers
              running around the clock. But our approach hasn't changed: every design is created
              in-house, every product is inspected by hand, and every order is packed with care.
            </p>
          </div>
        </div>
        <div className="relative h-80 lg:h-[500px] bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="font-display text-8xl text-brand-neon mb-4">3TEK</div>
              <div className="font-mono text-sm text-brand-light-gray uppercase tracking-widest">
                Design Studio • Austin, TX
              </div>
            </div>
          </div>
          {/* Grid overlay for cyberpunk effect */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(57, 255, 20, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <div className="font-mono text-sm text-brand-neon uppercase tracking-wider mb-4">
            What We Stand For
          </div>
          <h2 className="font-display text-3xl text-brand-white">
            Our Core Values
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div
                key={value.title}
                className="bg-brand-darker border border-brand-gray p-6 clip-corners"
              >
                <div className="p-3 bg-brand-neon/10 border border-brand-neon/30 inline-block mb-4">
                  <Icon className="h-6 w-6 text-brand-neon" />
                </div>
                <h3 className="font-display text-xl text-brand-white mb-2">
                  {value.title}
                </h3>
                <p className="text-brand-light-gray text-sm">
                  {value.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-20">
        <div className="bg-brand-darker border border-brand-gray p-8 md:p-12 clip-corners">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-4xl md:text-5xl text-brand-neon mb-2">20+</div>
              <div className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Industrial Printers
              </div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl text-brand-neon mb-2">10K+</div>
              <div className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Products Shipped
              </div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl text-brand-neon mb-2">50+</div>
              <div className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Countries Served
              </div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl text-brand-neon mb-2">4.9</div>
              <div className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="bg-brand-darker border border-brand-neon p-8 md:p-12 clip-corners">
          <h2 className="font-display text-3xl text-brand-white mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-brand-light-gray mb-8 max-w-xl mx-auto">
            Browse our collection of premium 3D printed products and find your next favorite piece.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-neon text-brand-black font-mono text-sm uppercase tracking-wider hover:bg-brand-neon/90 transition-colors clip-corners-sm"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  )
}
