'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CartItem } from '@/components/shop/cart-item'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Lock, ShoppingBag } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD_CENTS, DEFAULT_SHIPPING_CENTS } from '@/lib/constants'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, type AddressInput } from '@/lib/validations'
import { z } from 'zod'

const checkoutFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  shippingAddress: addressSchema,
})

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const cartTotal = total()
  const freeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD_CENTS
  const shippingCost = freeShipping ? 0 : DEFAULT_SHIPPING_CENTS
  const estimatedTotal = cartTotal + shippingCost

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        country: 'US',
      },
    },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      showError('Cart is empty', 'Please add items to your cart first.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            email: data.email,
            ...data.shippingAddress,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Checkout failed')
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      showError(
        'Checkout failed',
        err instanceof Error ? err.message : 'Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-20 w-20 text-brand-gray mx-auto mb-6" />
          <h1 className="font-display text-3xl text-brand-white mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-brand-light-gray mb-8">
            Add some products to your cart before checking out.
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <h1 className="font-display text-4xl text-brand-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Shipping Address
              </h2>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="fullName" required>
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('shippingAddress.fullName')}
                    error={errors.shippingAddress?.fullName?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine1" required>
                    Address Line 1
                  </Label>
                  <Input
                    id="addressLine1"
                    placeholder="123 Main St"
                    {...register('shippingAddress.addressLine1')}
                    error={errors.shippingAddress?.addressLine1?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    placeholder="Apt, suite, etc. (optional)"
                    {...register('shippingAddress.addressLine2')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" required>
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="City"
                      {...register('shippingAddress.city')}
                      error={errors.shippingAddress?.city?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" required>
                      State
                    </Label>
                    <Input
                      id="state"
                      placeholder="State"
                      {...register('shippingAddress.state')}
                      error={errors.shippingAddress?.state?.message}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" required>
                      ZIP Code
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="12345"
                      {...register('shippingAddress.postalCode')}
                      error={errors.shippingAddress?.postalCode?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      {...register('shippingAddress.phone')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners sticky top-24">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="max-h-64 overflow-y-auto mb-4 divide-y divide-brand-gray">
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    showControls={false}
                  />
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 py-4 border-t border-brand-gray">
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
                    {formatPrice(estimatedTotal)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                <Lock className="mr-2 h-4 w-4" />
                Pay with Stripe
              </Button>

              <p className="text-xs text-brand-light-gray text-center mt-4">
                You will be redirected to Stripe for secure payment processing.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
