import { RotateCcw, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Learn about our refund and return policy for 3TEK Design products.',
}

export default function RefundsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-neon/10 border border-brand-neon/30 mb-6">
            <RotateCcw className="h-8 w-8 text-brand-neon" />
          </div>
          <h1 className="font-display text-4xl text-brand-white mb-4">
            Refund Policy
          </h1>
          <p className="text-brand-light-gray">
            We want you to love your 3TEK products. If you're not completely satisfied,
            we're here to help.
          </p>
        </div>

        {/* Quick Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-brand-darker border border-brand-gray p-4 clip-corners text-center">
            <Clock className="h-6 w-6 text-brand-neon mx-auto mb-2" />
            <div className="font-display text-lg text-brand-white">30 Days</div>
            <div className="text-sm text-brand-light-gray">Return window</div>
          </div>
          <div className="bg-brand-darker border border-brand-gray p-4 clip-corners text-center">
            <RotateCcw className="h-6 w-6 text-brand-neon mx-auto mb-2" />
            <div className="font-display text-lg text-brand-white">Free Returns</div>
            <div className="text-sm text-brand-light-gray">On defective items</div>
          </div>
          <div className="bg-brand-darker border border-brand-gray p-4 clip-corners text-center">
            <CheckCircle className="h-6 w-6 text-brand-neon mx-auto mb-2" />
            <div className="font-display text-lg text-brand-white">5-7 Days</div>
            <div className="text-sm text-brand-light-gray">Refund processing</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Standard Return Policy
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                We offer a <strong className="text-brand-white">30-day return policy</strong> for
                most items. To be eligible for a return:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Items must be unused and in original condition</li>
                <li>Items must be in original packaging</li>
                <li>You must have proof of purchase (order number or receipt)</li>
                <li>Return must be initiated within 30 days of delivery</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Non-Returnable Items
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-brand-white">Custom orders</strong> - Items made to your specifications</li>
                <li><strong className="text-brand-white">Personalized items</strong> - Products with custom text or designs</li>
                <li><strong className="text-brand-white">Sale items</strong> - Final sale items marked as non-returnable</li>
                <li><strong className="text-brand-white">Used items</strong> - Products that have been used or damaged by the customer</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-neon p-6 clip-corners">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-brand-neon flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-display text-xl text-brand-white mb-2">
                  Damaged or Defective Items
                </h2>
                <div className="text-brand-light-gray space-y-4">
                  <p>
                    If your item arrives damaged or has a manufacturing defect:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Contact us within <strong className="text-brand-white">48 hours</strong> of delivery</li>
                    <li>Include photos of the damage</li>
                    <li>We'll send a replacement at no cost to you</li>
                    <li>No need to return the damaged item in most cases</li>
                  </ol>
                  <p>
                    We stand behind our products and will always make it right.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              How to Request a Return
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    1
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Contact Customer Service</div>
                    <div className="text-sm">
                      Email us at{' '}
                      <a href="mailto:returns@3tekdesign.com" className="text-brand-neon hover:underline">
                        returns@3tekdesign.com
                      </a>{' '}
                      with your order number and reason for return.
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    2
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Receive Return Authorization</div>
                    <div className="text-sm">
                      We'll review your request and send a return shipping label within 24 hours.
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    3
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Ship Your Return</div>
                    <div className="text-sm">
                      Pack the item securely and drop it off at the specified carrier location.
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-mono text-sm text-brand-white">
                    4
                  </span>
                  <div>
                    <div className="text-brand-white font-medium">Receive Your Refund</div>
                    <div className="text-sm">
                      Once we receive and inspect the return, we'll process your refund within 5-7 business days.
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Refund Details
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                <strong className="text-brand-white">Refund Method:</strong> Refunds are issued
                to the original payment method. Credit card refunds may take an additional
                5-10 business days to appear on your statement.
              </p>
              <p>
                <strong className="text-brand-white">Shipping Costs:</strong> Original shipping
                costs are non-refundable unless the return is due to our error or a defective product.
              </p>
              <p>
                <strong className="text-brand-white">Return Shipping:</strong> For non-defective
                returns, customers are responsible for return shipping costs. We recommend using
                a trackable shipping method.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Exchanges
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                Want to exchange for a different item? We're happy to help:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contact us to arrange an exchange</li>
                <li>Same item in different color/size: Free exchange</li>
                <li>Different item: Process as return + new order</li>
                <li>Price differences will be charged or refunded accordingly</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              Questions?
            </h2>
            <div className="text-brand-light-gray">
              <p>
                If you have any questions about our refund policy, please don't hesitate to reach out:
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  Email:{' '}
                  <a href="mailto:returns@3tekdesign.com" className="text-brand-neon hover:underline">
                    returns@3tekdesign.com
                  </a>
                </li>
                <li>
                  Contact Form:{' '}
                  <a href="/contact" className="text-brand-neon hover:underline">
                    3tekdesign.com/contact
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
