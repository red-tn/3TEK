import { Leaf, Recycle, Zap, Package, Factory, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sustainability',
  description: 'Learn about our commitment to sustainable 3D printing and eco-friendly practices.',
}

const initiatives = [
  {
    icon: Leaf,
    title: 'Plant-Based Materials',
    description: 'Our primary material, PLA, is made from renewable resources like corn starch. It\'s biodegradable under industrial composting conditions.',
  },
  {
    icon: Recycle,
    title: 'Zero-Waste Production',
    description: 'Failed prints and support material are collected, ground up, and recycled into new filament. Nothing goes to landfill.',
  },
  {
    icon: Factory,
    title: 'On-Demand Manufacturing',
    description: 'We only print what\'s ordered. No overproduction, no warehouse full of unsold inventory, no waste.',
  },
  {
    icon: Zap,
    title: 'Energy Efficient',
    description: 'Our facility runs on 100% renewable energy. We\'ve optimized our print settings to minimize energy consumption per part.',
  },
  {
    icon: Package,
    title: 'Eco-Friendly Packaging',
    description: 'All packaging is made from recycled cardboard and paper. No plastic bubble wrap or foam peanuts.',
  },
  {
    icon: Heart,
    title: 'Carbon Offset',
    description: 'We offset the carbon footprint of every shipment through verified reforestation projects.',
  },
]

const stats = [
  { value: '95%', label: 'Waste recycled' },
  { value: '100%', label: 'Renewable energy' },
  { value: '0', label: 'Plastic packaging' },
  { value: '1 tree', label: 'Planted per 50 orders' },
]

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-green-400/10 border border-green-400/30 mb-6">
          <Leaf className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Sustainability
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          3D printing has the potential to revolutionize manufacturing for the better.
          We're committed to making that potential a reality.
        </p>
      </div>

      {/* Mission Statement */}
      <section className="mb-20">
        <div className="bg-brand-darker border border-green-400/30 p-8 md:p-12 clip-corners">
          <div className="max-w-3xl mx-auto text-center">
            <div className="font-mono text-sm text-green-400 uppercase tracking-wider mb-4">
              Our Commitment
            </div>
            <blockquote className="font-display text-2xl md:text-3xl text-brand-white mb-6">
              "We believe the future of manufacturing is local, on-demand, and waste-free.
              Every decision we make is guided by this vision."
            </blockquote>
            <p className="text-brand-light-gray">
              Traditional manufacturing produces massive amounts of waste through overproduction,
              long supply chains, and excessive packaging. 3D printing allows us to flip that model
              on its head.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-4xl md:text-5xl text-green-400 mb-2">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Initiatives */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl text-brand-white">
            How We're Making a Difference
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initiatives.map((initiative) => {
            const Icon = initiative.icon
            return (
              <div
                key={initiative.title}
                className="bg-brand-darker border border-brand-gray p-6 clip-corners"
              >
                <div className="p-3 bg-green-400/10 border border-green-400/30 inline-block mb-4">
                  <Icon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-display text-xl text-brand-white mb-2">
                  {initiative.title}
                </h3>
                <p className="text-brand-light-gray text-sm">
                  {initiative.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* The 3D Printing Advantage */}
      <section className="mb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-sm text-green-400 uppercase tracking-wider mb-4">
              The 3D Printing Advantage
            </div>
            <h2 className="font-display text-3xl text-brand-white mb-6">
              Why 3D Printing is Inherently Sustainable
            </h2>
            <div className="space-y-4 text-brand-light-gray">
              <p>
                Traditional manufacturing often uses subtractive processes—starting with a large
                block of material and cutting away everything that isn't the final product.
                This can waste up to 90% of raw material.
              </p>
              <p>
                3D printing is additive. We only use the material needed to create the product,
                plus minimal support structures that we recycle. Waste is measured in grams,
                not kilograms.
              </p>
              <p>
                Additionally, on-demand manufacturing eliminates the need for large inventory,
                reducing the resources spent on warehousing and the waste from unsold products.
              </p>
            </div>
          </div>
          <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
            <h3 className="font-display text-xl text-brand-white mb-6">
              Traditional vs. 3D Printing
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-light-gray">Material Waste</span>
                  <span className="text-red-400">Traditional: Up to 90%</span>
                </div>
                <div className="h-2 bg-brand-gray rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-red-400" />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-brand-light-gray">3D Printing</span>
                  <span className="text-green-400">&lt;5%</span>
                </div>
                <div className="h-2 bg-brand-gray rounded-full overflow-hidden mt-1">
                  <div className="h-full w-[5%] bg-green-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-light-gray">Overproduction</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 text-center p-3 border border-red-400/30 bg-red-400/10">
                    <div className="text-red-400 font-mono text-sm">Traditional</div>
                    <div className="text-brand-white">Common</div>
                  </div>
                  <div className="flex-1 text-center p-3 border border-green-400/30 bg-green-400/10">
                    <div className="text-green-400 font-mono text-sm">3D Printing</div>
                    <div className="text-brand-white">Zero</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-light-gray">Supply Chain Length</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 text-center p-3 border border-red-400/30 bg-red-400/10">
                    <div className="text-red-400 font-mono text-sm">Traditional</div>
                    <div className="text-brand-white">Global</div>
                  </div>
                  <div className="flex-1 text-center p-3 border border-green-400/30 bg-green-400/10">
                    <div className="text-green-400 font-mono text-sm">3D Printing</div>
                    <div className="text-brand-white">Local</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="bg-brand-darker border border-green-400/30 p-8 clip-corners max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-brand-white mb-3">
            Shop with a Clear Conscience
          </h2>
          <p className="text-brand-light-gray mb-6">
            Every purchase supports sustainable manufacturing practices.
          </p>
          <a
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-400 text-brand-black font-mono text-sm uppercase tracking-wider hover:bg-green-400/90 transition-colors clip-corners-sm"
          >
            Shop Sustainably
          </a>
        </div>
      </section>
    </div>
  )
}
