import { Lightbulb, Cpu, Layers, Eye, Package, Truck } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Process',
  description: 'Discover how we create premium 3D printed products - from concept to delivery.',
}

const processSteps = [
  {
    step: '01',
    icon: Lightbulb,
    title: 'Design',
    description: 'Every product starts as a concept. Our designers sketch, iterate, and refine ideas until we have something truly unique. We focus on both aesthetics and functionality.',
    details: [
      'Hand-sketched concepts',
      'CAD modeling in Fusion 360',
      'Multiple design iterations',
      'Ergonomic considerations',
    ],
  },
  {
    step: '02',
    icon: Cpu,
    title: 'Optimization',
    description: 'Designs are optimized for 3D printing. We analyze every angle, support structure, and layer orientation to ensure the best possible print quality.',
    details: [
      'Printability analysis',
      'Support structure planning',
      'Layer orientation optimization',
      'Material selection',
    ],
  },
  {
    step: '03',
    icon: Layers,
    title: 'Printing',
    description: 'Using industrial-grade printers, we bring designs to life layer by layer. Our machines run 24/7, each calibrated for precision down to 0.1mm.',
    details: [
      'FDM and resin printing',
      '0.1mm layer precision',
      'Temperature-controlled environment',
      '24/7 production monitoring',
    ],
  },
  {
    step: '04',
    icon: Eye,
    title: 'Quality Control',
    description: 'Every single product is inspected by hand. We check for surface quality, dimensional accuracy, and structural integrity before approval.',
    details: [
      'Visual inspection',
      'Dimensional verification',
      'Stress testing',
      'Surface finish grading',
    ],
  },
  {
    step: '05',
    icon: Package,
    title: 'Finishing',
    description: 'Products receive final touches - support removal, sanding, and finishing treatments. Some items get additional coatings for durability or aesthetics.',
    details: [
      'Support removal',
      'Sanding and smoothing',
      'Protective coatings',
      'Custom color finishing',
    ],
  },
  {
    step: '06',
    icon: Truck,
    title: 'Delivery',
    description: 'Carefully packaged in eco-friendly materials, your order ships from our Austin facility to your doorstep, tracked every step of the way.',
    details: [
      'Custom protective packaging',
      'Eco-friendly materials',
      'Full tracking',
      'Insured shipping',
    ],
  },
]

export default function ProcessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Our Process
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          From the first sketch to your doorstep, every 3TEK product goes through a rigorous
          process designed for quality and precision.
        </p>
      </div>

      {/* Process Steps */}
      <div className="max-w-4xl mx-auto">
        {processSteps.map((item, index) => {
          const Icon = item.icon
          const isEven = index % 2 === 0

          return (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < processSteps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-px bg-brand-gray hidden md:block" />
              )}

              <div className={`flex flex-col md:flex-row gap-6 mb-12 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-16 h-16 bg-brand-darker border-2 border-brand-neon flex items-center justify-center clip-corners-sm">
                      <Icon className="h-7 w-7 text-brand-neon" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-brand-neon text-brand-black font-mono text-xs px-2 py-0.5">
                      {item.step}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 bg-brand-darker border border-brand-gray p-6 clip-corners ${isEven ? 'md:mr-8' : 'md:ml-8'}`}>
                  <h2 className="font-display text-2xl text-brand-white mb-3">
                    {item.title}
                  </h2>
                  <p className="text-brand-light-gray mb-4">
                    {item.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-brand-neon" />
                        <span className="text-brand-light-gray">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Technology Section */}
      <section className="mt-20">
        <div className="text-center mb-12">
          <div className="font-mono text-sm text-brand-neon uppercase tracking-wider mb-4">
            The Tech Behind It
          </div>
          <h2 className="font-display text-3xl text-brand-white">
            Industrial-Grade Equipment
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners text-center">
            <div className="font-display text-4xl text-brand-neon mb-2">0.1mm</div>
            <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-4">
              Layer Resolution
            </div>
            <p className="text-brand-light-gray text-sm">
              Our printers achieve incredibly fine detail with layers as thin as 0.1mm,
              creating smooth, professional finishes.
            </p>
          </div>

          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners text-center">
            <div className="font-display text-4xl text-brand-neon mb-2">±0.2mm</div>
            <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-4">
              Dimensional Accuracy
            </div>
            <p className="text-brand-light-gray text-sm">
              Precision calibration ensures every product matches design specs within
              a fraction of a millimeter.
            </p>
          </div>

          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners text-center">
            <div className="font-display text-4xl text-brand-neon mb-2">24/7</div>
            <div className="font-mono text-sm text-brand-light-gray uppercase tracking-wider mb-4">
              Production Capacity
            </div>
            <p className="text-brand-light-gray text-sm">
              Our automated facility operates around the clock, ensuring quick
              turnaround without sacrificing quality.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <p className="text-brand-light-gray mb-6">
          Have questions about our process or want to discuss a custom project?
        </p>
        <a
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-neon text-brand-black font-mono text-sm uppercase tracking-wider hover:bg-brand-neon/90 transition-colors clip-corners-sm"
        >
          Get in Touch
        </a>
      </section>
    </div>
  )
}
