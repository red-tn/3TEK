import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how 3TEK Design collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl text-brand-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-brand-light-gray">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              1. Information We Collect
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Order history and preferences</li>
                <li>Communications you send to us</li>
              </ul>
              <p>
                We also automatically collect certain information when you visit our site:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              2. How We Use Your Information
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your questions and requests</li>
                <li>Improve our products and services</li>
                <li>Send promotional emails (with your consent)</li>
                <li>Prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              3. Information Sharing
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-brand-white">Service Providers:</strong> Companies that help us operate
                  our business (payment processing, shipping, email services)
                </li>
                <li>
                  <strong className="text-brand-white">Shipping Partners:</strong> To deliver your orders
                </li>
                <li>
                  <strong className="text-brand-white">Legal Requirements:</strong> When required by law or to
                  protect our rights
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              4. Data Security
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through Stripe (PCI-DSS compliant)</li>
                <li>Limited access to personal information</li>
                <li>Regular security audits</li>
              </ul>
              <p>
                While we strive to protect your information, no method of transmission over
                the internet is 100% secure.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              5. Your Rights
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
              <p>
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@3tekdesign.com" className="text-brand-neon hover:underline">
                  privacy@3tekdesign.com
                </a>
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              6. Cookies
            </h2>
            <div className="text-brand-light-gray space-y-4">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you logged in</li>
                <li>Remember your cart contents</li>
                <li>Understand how you use our site</li>
                <li>Improve your experience</li>
              </ul>
              <p>
                You can control cookies through your browser settings, but some features
                may not work properly without them.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              7. Children's Privacy
            </h2>
            <div className="text-brand-light-gray">
              <p>
                Our services are not directed to children under 13. We do not knowingly
                collect personal information from children under 13. If you believe we
                have collected information from a child, please contact us.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              8. Changes to This Policy
            </h2>
            <div className="text-brand-light-gray">
              <p>
                We may update this privacy policy from time to time. We will notify you
                of any changes by posting the new policy on this page and updating the
                "Last updated" date.
              </p>
            </div>
          </section>

          <section className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-4">
              9. Contact Us
            </h2>
            <div className="text-brand-light-gray">
              <p>
                If you have questions about this privacy policy, please contact us:
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  Email:{' '}
                  <a href="mailto:privacy@3tekdesign.com" className="text-brand-neon hover:underline">
                    privacy@3tekdesign.com
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
