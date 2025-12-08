export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  sku?: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export interface CartActions {
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export interface CartStore extends CartState, CartActions {
  total: () => number
  itemCount: () => number
  subtotal: () => number
}

export interface CheckoutItem {
  productId: string
  quantity: number
}

export interface CheckoutSession {
  items: CheckoutItem[]
  shippingAddress: ShippingAddress
  shippingRate: number
  couponCode?: string
}

export interface ShippingAddress {
  email: string
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}
