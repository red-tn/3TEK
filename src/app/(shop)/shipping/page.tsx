import { Truck, Package, RotateCcw, Clock, Globe, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping & Returns',
  description: 'Learn about our shipping options, delivery times, and hassle-free return policy.',
}

const shippingOptions = [
  {
    name: 'Standard Shipping',
    price: '$5.99',
    time: '5-7 business days',
    description: 'Reliable delivery for non-urgent orders',
  },
  {
    name: 'Express Shipping',
    price: '$12.99',
    time: '2-3 business days',
    description: 'Fast delivery when you need it sooner',
  },
  {
    name: 'Free Shipping',
    price: 'FREE',
    time: '5-7 business days',
    description: 'On all orders over $50',
    highlight: true,
  },
]

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Shipping & Returns
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          Fast, reliable shipping and hassle-free returns. We want you to love your 3TEK products.
        </p>
      </div>

      {/* Shipping Options */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-brand-white mb-6 flex items-center gap-3">
          <Truck className="h-6 w-6 text-brand-neon" />
          Shipping Options
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {shippingOptions.map((option) => (
            <div
              key={option.name}
              className={`bg-brand-darker border p-6 clip-corners ${
                option.highlight
                  ? 'border-brand-neon'
                  : 'border-brand-gray'
              }`}
            >
              {option.highlight && (
                <div className="font-mono text-xs text-brand-neon uppercase tracking-wider mb-2">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-xl text-brand-white mb-1">
                {option.name}
              </h3>
              <div className="text-2xl font-bold text-brand-neon mb-2">
                {option.price}
              </div>
              <div className="font-mono text-sm text-brand-light-gray mb-2">
                {option.time}
              </div>
              <p className="text-brand-light-gray text-sm">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Shipping Info Grid */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <Package className="h-8 w-8 text-brand-neon mb-4" />
            <h3 className="font-display text-lg text-brand-white mb-2">
              Order Processing
            </h3>
            <p className="text-brand-light-gray text-sm">
              Orders are processed within 1-2 business days. Custom and made-to-order
              items may take 3-5 additional days for production.
            </p>
          </div>

          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <Globe className="h-8 w-8 text-brand-neon mb-4" />
            <h3 className="font-display text-lg text-brand-white mb-2">
              International Shipping
            </h3>
            <p className="text-brand-light-gray text-sm">
              We ship worldwide! International orders typically take 10-14 business days.
              Customs fees may apply depending on your country.
            </p>
          </div>

          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <Clock className="h-8 w-8 text-brand-neon mb-4" />
            <h3 className="font-display text-lg text-brand-white mb-2">
              Tracking Your Order
            </h3>
            <p className="text-brand-light-gray text-sm">
              All orders include tracking. You'll receive an email with your tracking
              number as soon as your order ships.
            </p>
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-brand-white mb-6 flex items-center gap-3">
          <RotateCcw className="h-6 w-6 text-brand-neon" />
          Returns Policy
        </h2>
        <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display text-xl text-brand-white mb-4">
                30-Day Return Window
              </h3>
              <p className="text-brand-light-gray mb-4">
                Not completely satisfied? No problem. Return any unused item in its
                original packaging within 30 days for a full refund.
              </p>
              <ul className="space-y-2 text-brand-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-brand-neon mt-1">✓</span>
                  Items must be unused and in original packaging
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-neon mt-1">✓</span>
                  Return shipping is free for defective items
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-neon mt-1">✓</span>
                  Refunds processed within 5-7 business days
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-xl text-brand-white mb-4">
                How to Return
              </h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    1
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Contact Us</div>
                    <div className="text-brand-light-gray text-sm">
                      Email us with your order number and reason for return
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    2
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Get Your Label</div>
                    <div className="text-brand-light-gray text-sm">
                      We'll send you a prepaid return shipping label
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    3
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Ship It Back</div>
                    <div className="text-brand-light-gray text-sm">
                      Drop off at any carrier location
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    4
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Get Refunded</div>
                    <div className="text-brand-light-gray text-sm">
                      Refund issued within 5-7 business days of receipt
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Damaged Items */}
      <section>
        <div className="bg-brand-darker border border-brand-neon p-6 clip-corners">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-brand-neon flex-shrink-0" />
            <div>
              <h3 className="font-display text-xl text-brand-white mb-2">
                Damaged or Defective Items?
              </h3>
              <p className="text-brand-light-gray">
                If your item arrives damaged or has a manufacturing defect, contact us within
                48 hours with photos. We'll ship a replacement immediately at no cost to you.
                Your satisfaction is our priority.
              </p>
              <a
                href="/contact"
                className="inline-block mt-4 font-mono text-sm text-brand-neon hover:underline uppercase tracking-wider"
              >
                Report an Issue →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
