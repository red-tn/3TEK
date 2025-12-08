import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Postal code is required'),
  country: z.string().default('US'),
  phone: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  priceCents: z.number().min(0, 'Price must be positive'),
  compareAtPriceCents: z.number().min(0).optional().nullable(),
  costCents: z.number().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  weightOz: z.number().optional().nullable(),
  material: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  printTimeHours: z.number().optional().nullable(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  badge: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code is required').toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive('Discount value must be positive'),
  minimumOrderCents: z.number().min(0).optional().nullable(),
  maximumUses: z.number().int().positive().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const shippingRateSchema = z.object({
  name: z.string().min(2, 'Shipping rate name is required'),
  description: z.string().optional(),
  carrier: z.string().optional(),
  minWeightOz: z.number().min(0).optional().nullable(),
  maxWeightOz: z.number().min(0).optional().nullable(),
  minOrderCents: z.number().min(0).optional().nullable(),
  maxOrderCents: z.number().min(0).optional().nullable(),
  rateCents: z.number().min(0, 'Rate must be positive'),
  estimatedDaysMin: z.number().int().positive().optional().nullable(),
  estimatedDaysMax: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
})

export const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
})

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type CouponInput = z.infer<typeof couponSchema>
export type ShippingRateInput = z.infer<typeof shippingRateSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ProfileInput = z.infer<typeof profileSchema>
