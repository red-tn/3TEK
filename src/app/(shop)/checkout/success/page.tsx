'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  // Clear cart on successful checkout
  useEffect(() => {
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-neon/10 border-2 border-brand-neon">
            <CheckCircle className="h-10 w-10 text-brand-neon" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl text-brand-white mb-4">
          Order Confirmed!
        </h1>

        {/* Message */}
        <p className="text-brand-light-gray text-lg mb-8">
          Thank you for your order! We&apos;ve received your payment and will start
          processing your order right away. You&apos;ll receive a confirmation email
          shortly.
        </p>

        {/* Order Info */}
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners mb-8">
          <div className="flex items-center justify-center gap-3 text-brand-neon mb-4">
            <Package className="h-6 w-6" />
            <span className="font-mono text-sm uppercase tracking-wider">
              What Happens Next?
            </span>
          </div>
          <ol className="text-left space-y-4 text-sm text-brand-light-gray">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gray flex items-center justify-center font-mono text-xs text-brand-white">
                1
              </span>
              <span>
                You&apos;ll receive an email confirmation with your order details
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gray flex items-center justify-center font-mono text-xs text-brand-white">
                2
              </span>
              <span>
                We&apos;ll start 3D printing your products (usually within 24 hours)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gray flex items-center justify-center font-mono text-xs text-brand-white">
                3
              </span>
              <span>
                Quality check and careful packaging
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-gray flex items-center justify-center font-mono text-xs text-brand-white">
                4
              </span>
              <span>
                Shipping notification with tracking number
              </span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/account/orders">
              View My Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {/* Support */}
        <p className="mt-8 text-sm text-brand-light-gray">
          Questions about your order?{' '}
          <Link href="/contact" className="text-brand-neon hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
