'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { CartItem } from './cart-item'
import { formatPrice } from '@/lib/utils'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD_CENTS } from '@/lib/constants'

export function CartSheet() {
  const { items, isOpen, closeCart, total, clearCart } = useCart()
  const cartTotal = total()
  const itemCount = items.length
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD_CENTS - cartTotal

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeCart])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-brand-black/80 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-brand-darker border-l border-brand-gray transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-brand-gray">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-neon" />
              <h2 className="font-display text-xl text-brand-white">
                Your Cart
              </h2>
              {itemCount > 0 && (
                <span className="font-mono text-xs text-brand-light-gray">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Free Shipping Progress */}
          {itemCount > 0 && remainingForFreeShipping > 0 && (
            <div className="px-4 py-3 bg-brand-dark border-b border-brand-gray">
              <p className="text-sm text-brand-light-gray mb-2">
                Add{' '}
                <span className="text-brand-neon font-mono">
                  {formatPrice(remainingForFreeShipping)}
                </span>{' '}
                more for free shipping!
              </p>
              <div className="h-1.5 bg-brand-gray overflow-hidden">
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

          {itemCount > 0 && remainingForFreeShipping <= 0 && (
            <div className="px-4 py-3 bg-brand-neon/10 border-b border-brand-neon/20">
              <p className="text-sm text-brand-neon flex items-center gap-2">
                <span className="text-lg">🎉</span>
                You&apos;ve unlocked free shipping!
              </p>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {itemCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <ShoppingBag className="h-16 w-16 text-brand-gray mb-4" />
                <h3 className="font-display text-xl text-brand-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-brand-light-gray mb-6">
                  Add some awesome 3D printed products to get started!
                </p>
                <Button onClick={closeCart} asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="px-4 space-y-4">
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {itemCount > 0 && (
            <div className="border-t border-brand-gray p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm uppercase tracking-wider text-brand-light-gray">
                  Subtotal
                </span>
                <span className="font-mono text-xl text-brand-neon">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <p className="text-xs text-brand-light-gray">
                Shipping and taxes calculated at checkout
              </p>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" onClick={closeCart} asChild>
                  <Link href="/checkout" className="flex items-center gap-2">
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeCart}
                    asChild
                  >
                    <Link href="/cart">View Cart</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-400"
                    onClick={() => {
                      if (confirm('Clear all items from cart?')) {
                        clearCart()
                      }
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
