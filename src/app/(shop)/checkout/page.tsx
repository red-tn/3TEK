'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CartItem } from '@/components/shop/cart-item'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, Lock, ShoppingBag, Tag, Truck, Loader2, Check, X } from 'lucide-react'
import { TAX_RATE } from '@/lib/constants'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema } from '@/lib/validations'
import { z } from 'zod'

const checkoutFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  shippingAddress: addressSchema,
})

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

interface ShippingRate {
  id: string
  name: string
  description: string | null
  price_cents: number
  estimated_days_min: number | null
  estimated_days_max: number | null
}

interface CouponData {
  id: string
  code: string
  discountType: 'percentage' | 'fixed_amount'
  discountValue: number
  description: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const { error: showError, success } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [discountCents, setDiscountCents] = useState(0)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Shipping state
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [selectedShippingId, setSelectedShippingId] = useState<string>('')
  const [isLoadingShipping, setIsLoadingShipping] = useState(false)

  const cartTotal = total()

  // Fetch shipping rates when cart total changes
  useEffect(() => {
    async function fetchShippingRates() {
      if (cartTotal === 0) return

      setIsLoadingShipping(true)
      try {
        const response = await fetch('/api/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subtotalCents: cartTotal }),
        })
        const data = await response.json()
        if (data.rates && data.rates.length > 0) {
          setShippingRates(data.rates)
          // Auto-select first rate
          if (!selectedShippingId || !data.rates.find((r: ShippingRate) => r.id === selectedShippingId)) {
            setSelectedShippingId(data.rates[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch shipping rates:', err)
      } finally {
        setIsLoadingShipping(false)
      }
    }
    fetchShippingRates()
  }, [cartTotal])

  // Get selected shipping rate
  const selectedShipping = shippingRates.find(r => r.id === selectedShippingId)
  const shippingCents = selectedShipping?.price_cents || 0

  // Calculate totals
  const taxableAmount = cartTotal - discountCents
  const taxCents = Math.round(taxableAmount * TAX_RATE)
  const estimatedTotal = cartTotal - discountCents + shippingCents + taxCents

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

  // Validate and apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotalCents: cartTotal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setCouponError(data.error || 'Invalid coupon code')
        return
      }

      setAppliedCoupon(data.coupon)
      setDiscountCents(data.discountCents)
      success('Coupon applied!', `Saved ${formatPrice(data.discountCents)}`)
    } catch (err) {
      console.error('Coupon validation error:', err)
      setCouponError('Failed to validate coupon')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountCents(0)
    setCouponCode('')
    setCouponError('')
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      showError('Cart is empty', 'Please add items to your cart first.')
      return
    }

    if (!selectedShippingId) {
      showError('Select shipping', 'Please select a shipping method.')
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
          couponCode: appliedCoupon?.code || undefined,
          shippingRateId: selectedShippingId,
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

            {/* Shipping Method */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Method
              </h2>
              {isLoadingShipping ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-neon" />
                </div>
              ) : shippingRates.length > 0 ? (
                <div className="space-y-3">
                  {shippingRates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedShippingId === rate.id
                          ? 'border-brand-neon bg-brand-neon/5'
                          : 'border-brand-gray hover:border-brand-light-gray'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={rate.id}
                          checked={selectedShippingId === rate.id}
                          onChange={(e) => setSelectedShippingId(e.target.value)}
                          className="w-4 h-4 accent-brand-neon"
                        />
                        <div>
                          <p className="text-brand-white font-medium">{rate.name}</p>
                          {rate.description && (
                            <p className="text-sm text-brand-light-gray">{rate.description}</p>
                          )}
                          {rate.estimated_days_min && rate.estimated_days_max && (
                            <p className="text-xs text-brand-light-gray mt-1">
                              {rate.estimated_days_min}-{rate.estimated_days_max} business days
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-brand-neon">
                        {rate.price_cents === 0 ? 'FREE' : formatPrice(rate.price_cents)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-brand-light-gray text-center py-4">
                  No shipping rates available
                </p>
              )}
            </div>

            {/* Coupon Code */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Coupon Code
              </h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-4 bg-brand-neon/10 border border-brand-neon rounded-lg">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-brand-neon" />
                    <div>
                      <p className="text-brand-white font-medium font-mono">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-brand-light-gray">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% off`
                          : `${formatPrice(appliedCoupon.discountValue)} off`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-brand-neon">
                      -{formatPrice(discountCents)}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-brand-light-gray hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError('')
                      }}
                      className="flex-1 font-mono uppercase"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon}
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-sm text-red-500">{couponError}</p>
                  )}
                </div>
              )}
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
                {discountCents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-light-gray">Discount</span>
                    <span className="font-mono text-brand-neon">
                      -{formatPrice(discountCents)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-brand-light-gray">Shipping</span>
                  <span className="font-mono text-brand-white">
                    {shippingCents === 0 ? (
                      <span className="text-brand-neon">FREE</span>
                    ) : (
                      formatPrice(shippingCents)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-light-gray">
                    Tax ({(TAX_RATE * 100).toFixed(2)}%)
                  </span>
                  <span className="font-mono text-brand-white">
                    {formatPrice(taxCents)}
                  </span>
                </div>
              </div>

              <div className="border-t border-brand-gray pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-mono text-sm uppercase tracking-wider text-brand-light-gray">
                    Total
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
                disabled={shippingRates.length === 0}
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
