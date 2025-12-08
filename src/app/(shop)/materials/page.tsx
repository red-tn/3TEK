import { Leaf, Flame, Droplets, Shield, Sparkles, Wrench } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Materials',
  description: 'Learn about the premium materials we use for our 3D printed products.',
}

const materials = [
  {
    name: 'PLA',
    fullName: 'Polylactic Acid',
    icon: Leaf,
    color: 'text-green-400',
    borderColor: 'border-green-400/30',
    bgColor: 'bg-green-400/10',
    description: 'Our most popular material. Plant-based, biodegradable, and perfect for indoor products.',
    properties: [
      { label: 'Eco-Friendly', value: 'Made from corn starch' },
      { label: 'Finish', value: 'Smooth, matte' },
      { label: 'Durability', value: 'Good' },
      { label: 'Best For', value: 'Decorative items, desk accessories' },
    ],
    pros: ['Biodegradable', 'Low warping', 'Great detail', 'Wide color range'],
    cons: ['Not heat resistant (>60°C)', 'Indoor use only'],
  },
  {
    name: 'PETG',
    fullName: 'Polyethylene Terephthalate Glycol',
    icon: Shield,
    color: 'text-blue-400',
    borderColor: 'border-blue-400/30',
    bgColor: 'bg-blue-400/10',
    description: 'A durable, chemical-resistant material ideal for functional parts that need to withstand wear.',
    properties: [
      { label: 'Strength', value: 'High impact resistance' },
      { label: 'Finish', value: 'Glossy, transparent option' },
      { label: 'Durability', value: 'Excellent' },
      { label: 'Best For', value: 'Functional items, outdoor use' },
    ],
    pros: ['UV resistant', 'Chemical resistant', 'Food-safe options', 'Recyclable'],
    cons: ['Slightly more expensive', 'Can string during printing'],
  },
  {
    name: 'ABS',
    fullName: 'Acrylonitrile Butadiene Styrene',
    icon: Flame,
    color: 'text-orange-400',
    borderColor: 'border-orange-400/30',
    bgColor: 'bg-orange-400/10',
    description: 'The same material used in LEGO bricks. Heat-resistant and incredibly tough.',
    properties: [
      { label: 'Heat Resistance', value: 'Up to 100°C' },
      { label: 'Finish', value: 'Matte, can be smoothed' },
      { label: 'Durability', value: 'Excellent' },
      { label: 'Best For', value: 'Automotive, high-temp applications' },
    ],
    pros: ['Heat resistant', 'Acetone smoothing', 'Very durable', 'Impact resistant'],
    cons: ['Requires ventilation', 'Can warp if not printed correctly'],
  },
  {
    name: 'TPU',
    fullName: 'Thermoplastic Polyurethane',
    icon: Droplets,
    color: 'text-purple-400',
    borderColor: 'border-purple-400/30',
    bgColor: 'bg-purple-400/10',
    description: 'Flexible, rubber-like material perfect for products that need to bend or absorb impact.',
    properties: [
      { label: 'Flexibility', value: 'High elasticity' },
      { label: 'Finish', value: 'Smooth, slightly tacky' },
      { label: 'Durability', value: 'Excellent' },
      { label: 'Best For', value: 'Phone cases, grips, gaskets' },
    ],
    pros: ['Flexible', 'Abrasion resistant', 'Oil resistant', 'Shock absorbing'],
    cons: ['Harder to print', 'Limited color options'],
  },
  {
    name: 'Resin',
    fullName: 'Photopolymer Resin',
    icon: Sparkles,
    color: 'text-pink-400',
    borderColor: 'border-pink-400/30',
    bgColor: 'bg-pink-400/10',
    description: 'Ultra-high detail material for intricate designs, miniatures, and jewelry.',
    properties: [
      { label: 'Detail', value: 'Extremely fine (25μm)' },
      { label: 'Finish', value: 'Ultra-smooth, paintable' },
      { label: 'Durability', value: 'Moderate (can be brittle)' },
      { label: 'Best For', value: 'Miniatures, jewelry, detailed art' },
    ],
    pros: ['Incredible detail', 'Smooth surface', 'Isotropic strength', 'Great for small items'],
    cons: ['More brittle', 'UV sensitive', 'Higher cost'],
  },
  {
    name: 'Composites',
    fullName: 'Fiber-Reinforced Materials',
    icon: Wrench,
    color: 'text-gray-400',
    borderColor: 'border-gray-400/30',
    bgColor: 'bg-gray-400/10',
    description: 'PLA or PETG infused with carbon fiber, wood, or metal for unique properties and aesthetics.',
    properties: [
      { label: 'Variants', value: 'Carbon, wood, metal fill' },
      { label: 'Finish', value: 'Unique textures' },
      { label: 'Durability', value: 'Varies by composite' },
      { label: 'Best For', value: 'Premium products, specialty items' },
    ],
    pros: ['Unique aesthetics', 'Enhanced properties', 'Premium feel', 'Special finishes'],
    cons: ['Abrasive on printers', 'Higher cost', 'Limited availability'],
  },
]

export default function MaterialsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Our Materials
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          We carefully select materials based on each product's requirements.
          Here's what goes into your 3TEK products.
        </p>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {materials.map((material) => {
          const Icon = material.icon
          return (
            <div
              key={material.name}
              className={`bg-brand-darker border ${material.borderColor} p-6 clip-corners`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 ${material.bgColor} border ${material.borderColor}`}>
                  <Icon className={`h-6 w-6 ${material.color}`} />
                </div>
                <div>
                  <h2 className={`font-display text-2xl ${material.color}`}>
                    {material.name}
                  </h2>
                  <div className="font-mono text-xs text-brand-light-gray uppercase tracking-wider">
                    {material.fullName}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-brand-light-gray text-sm mb-4">
                {material.description}
              </p>

              {/* Properties */}
              <div className="space-y-2 mb-4">
                {material.properties.map((prop) => (
                  <div key={prop.label} className="flex justify-between text-sm">
                    <span className="text-brand-light-gray">{prop.label}</span>
                    <span className="text-brand-white">{prop.value}</span>
                  </div>
                ))}
              </div>

              {/* Pros/Cons */}
              <div className="pt-4 border-t border-brand-gray">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-mono text-xs text-green-400 uppercase tracking-wider mb-2">
                      Pros
                    </div>
                    <ul className="space-y-1">
                      {material.pros.map((pro) => (
                        <li key={pro} className="text-xs text-brand-light-gray flex items-center gap-1">
                          <span className="text-green-400">+</span> {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-red-400 uppercase tracking-wider mb-2">
                      Cons
                    </div>
                    <ul className="space-y-1">
                      {material.cons.map((con) => (
                        <li key={con} className="text-xs text-brand-light-gray flex items-center gap-1">
                          <span className="text-red-400">-</span> {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Food Safety Note */}
      <section className="mb-16">
        <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
          <h2 className="font-display text-2xl text-brand-white mb-4">
            A Note on Food Safety
          </h2>
          <p className="text-brand-light-gray mb-4">
            While some of our materials (like certain PETG formulations) can be food-safe,
            3D printing introduces considerations around layer lines and surface porosity.
          </p>
          <p className="text-brand-light-gray">
            Products specifically designed for food contact are printed with food-safe materials
            and may include additional coatings. Always check the product description for
            food-safe certifications before using any item with food.
          </p>
        </div>
      </section>

      {/* Custom Materials CTA */}
      <section className="text-center">
        <div className="bg-brand-darker border border-brand-neon p-8 clip-corners max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-brand-white mb-3">
            Need a Specific Material?
          </h2>
          <p className="text-brand-light-gray mb-6">
            We can source specialty materials for custom projects. Contact us to discuss
            your requirements.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-neon text-brand-black font-mono text-sm uppercase tracking-wider hover:bg-brand-neon/90 transition-colors clip-corners-sm"
          >
            Discuss Your Project
          </a>
        </div>
      </section>
    </div>
  )
}
