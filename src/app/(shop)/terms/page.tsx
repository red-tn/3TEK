import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using 3TEK Design products and services.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl text-brand-white mb-4">
            Terms of Service
          </h1>
          <p className="text-brand-light-gray">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              1. Agreement to Terms
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                By accessing or using the 3TEK Design website and purchasing our products,
                you agree to be bound by these Terms of Service. If you do not agree to
                these terms, please do not use our services.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              2. Products and Orders
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                <strong className="text-brand-white">Product Descriptions:</strong> We strive to
                describe our products as accurately as possible. Colors may vary slightly due to
                monitor settings and the nature of 3D printing.
              </p>
              <p>
                <strong className="text-brand-white">Pricing:</strong> All prices are in USD and
                subject to change without notice. We reserve the right to correct pricing errors.
              </p>
              <p>
                <strong className="text-brand-white">Order Acceptance:</strong> We reserve the right
                to refuse or cancel any order for any reason, including suspected fraud or
                product unavailability.
              </p>
              <p>
                <strong className="text-brand-white">Made-to-Order:</strong> Many of our products are
                made-to-order using 3D printing. Production typically begins within 24-48 hours
                of order placement.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              3. Shipping and Delivery
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                Shipping times are estimates and not guaranteed. We are not responsible for
                delays caused by shipping carriers, customs, or events outside our control.
              </p>
              <p>
                Risk of loss passes to you upon delivery to the carrier. For damaged shipments,
                contact us within 48 hours of delivery with photos.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              4. Returns and Refunds
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                Please see our <a href="/refunds" className="text-brand-neon hover:underline">Refund Policy</a> for
                complete details on returns, exchanges, and refunds.
              </p>
              <p>
                Custom orders are final sale and cannot be returned unless defective.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              5. Intellectual Property
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                All content on this website, including designs, images, text, and logos, is
                owned by 3TEK Design and protected by copyright and trademark laws.
              </p>
              <p>
                You may not reproduce, distribute, or create derivative works from our designs
                without written permission.
              </p>
              <p>
                Products purchased are for personal use only. Commercial reproduction or resale
                of our designs is prohibited.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              6. Custom Orders
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                For custom orders:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must own or have rights to any designs you submit</li>
                <li>We reserve the right to refuse projects that infringe on third-party rights</li>
                <li>Custom orders require 50% deposit, with balance due before shipping</li>
                <li>Design files remain the property of the original creator</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              7. Product Use and Safety
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                Our products are designed for their intended purposes as described. Users assume
                all risks associated with product use.
              </p>
              <p>
                Not all products are food-safe. Only use products marked as food-safe for food
                contact. Keep small products away from children who may choke on small parts.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              8. Limitation of Liability
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                To the maximum extent permitted by law, 3TEK Design shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages arising from
                your use of our products or services.
              </p>
              <p>
                Our total liability for any claim shall not exceed the amount you paid for the
                product giving rise to the claim.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              9. Account Terms
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                If you create an account:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for maintaining account security</li>
                <li>You must provide accurate and complete information</li>
                <li>You must be at least 18 years old</li>
                <li>We may suspend or terminate accounts that violate these terms</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              10. Changes to Terms
            </h2>
            <div className="text-brand-light-gray">
              <p>
                We reserve the right to modify these terms at any time. Changes are effective
                upon posting to this page. Your continued use of our services after changes
                constitutes acceptance of the new terms.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              11. Governing Law
            </h2>
            <div className="text-brand-light-gray">
              <p>
                These terms are governed by the laws of the State of Texas, United States,
                without regard to conflict of law principles. Any disputes shall be resolved
                in the courts of Travis County, Texas.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              12. Contact
            </h2>
            <div className="text-brand-light-gray">
              <p>
                Questions about these terms? Contact us:
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  Email:{' '}
                  <a href="mailto:legal@3tekdesign.com" className="text-brand-neon hover:underline">
                    legal@3tekdesign.com
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
