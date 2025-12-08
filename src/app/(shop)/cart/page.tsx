'use client'

import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { CartItem } from '@/components/shop/cart-item'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD_CENTS, DEFAULT_SHIPPING_CENTS } from '@/lib/constants'

export default function CartPage() {
  const { items, total, clearCart } = useCart()
  const cartTotal = total()
  const freeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD_CENTS
  const shippingCost = freeShipping ? 0 : DEFAULT_SHIPPING_CENTS
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD_CENTS - cartTotal

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-20 w-20 text-brand-gray mx-auto mb-6" />
          <h1 className="font-display text-3xl text-brand-white mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-brand-light-gray mb-8">
            Looks like you haven&apos;t added any products yet. Start shopping to
            fill your cart with awesome 3D printed products!
          </p>
          <Button asChild>
            <Link href="/products">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-brand-white mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {/* Free Shipping Progress */}
          {remainingForFreeShipping > 0 && (
            <div className="bg-brand-dark border border-brand-gray p-4 mb-6 clip-corners">
              <p className="text-sm text-brand-light-gray mb-2">
                Add{' '}
                <span className="text-brand-neon font-mono">
                  {formatPrice(remainingForFreeShipping)}
                </span>{' '}
                more for free shipping!
              </p>
              <div className="h-2 bg-brand-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-neon transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (cartTotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {freeShipping && (
            <div className="bg-brand-neon/10 border border-brand-neon/20 p-4 mb-6 clip-corners">
              <p className="text-brand-neon flex items-center gap-2">
                <span className="text-lg">🎉</span>
                You&apos;ve unlocked free shipping!
              </p>
            </div>
          )}

          {/* Items */}
          <div className="bg-brand-darker border border-brand-gray clip-corners">
            <div className="p-4 border-b border-brand-gray flex items-center justify-between">
              <span className="font-mono text-sm text-brand-light-gray uppercase tracking-wider">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400"
                onClick={() => {
                  if (confirm('Clear all items from cart?')) {
                    clearCart()
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
            <div className="divide-y divide-brand-gray px-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners sticky top-24">
            <h2 className="font-display text-xl text-brand-white mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-brand-light-gray">Subtotal</span>
                <span className="font-mono text-brand-white">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-light-gray">Shipping</span>
                <span className="font-mono text-brand-white">
                  {freeShipping ? (
                    <span className="text-brand-neon">FREE</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-light-gray">Tax</span>
                <span className="font-mono text-brand-light-gray">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="border-t border-brand-gray pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-mono text-sm uppercase tracking-wider text-brand-light-gray">
                  Estimated Total
                </span>
                <span className="font-mono text-2xl text-brand-neon">
                  {formatPrice(cartTotal + shippingCost)}
                </span>
              </div>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <p className="text-xs text-brand-light-gray text-center mt-4">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
