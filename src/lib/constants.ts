export const SITE_NAME = '3TEK Design'
export const SITE_DESCRIPTION = 'Premium 3D printed products with a cyberpunk industrial vibe'
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500' },
  { value: 'printing', label: 'Printing', color: 'bg-brand-rust' },
  { value: 'quality_check', label: 'Quality Check', color: 'bg-orange-500' },
  { value: 'ready_to_ship', label: 'Ready to Ship', color: 'bg-cyan-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-brand-neon' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500' },
] as const

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'failed', label: 'Failed', color: 'bg-red-500' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500' },
  { value: 'partially_refunded', label: 'Partially Refunded', color: 'bg-orange-500' },
] as const

export const PRINT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'queued', label: 'Queued' },
  { value: 'printing', label: 'Printing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const

export const USER_ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const

export const DEFAULT_SHIPPING_CENTS = 599
export const FREE_SHIPPING_THRESHOLD_CENTS = 7500
export const TAX_RATE = 0.0825

export const NAV_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'ShoppingCart' },
  { label: 'Products', href: '/admin/products', icon: 'Package' },
  { label: 'Categories', href: '/admin/categories', icon: 'FolderTree' },
  { label: 'Customers', href: '/admin/customers', icon: 'Users' },
  { label: 'Shipping', href: '/admin/shipping', icon: 'Truck' },
  { label: 'Coupons', href: '/admin/coupons', icon: 'Tag' },
  { label: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const
