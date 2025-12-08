export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'admin' | 'super_admin'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: 'shipping' | 'billing'
          is_default: boolean
          full_name: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: 'shipping' | 'billing'
          is_default?: boolean
          full_name: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'shipping' | 'billing'
          is_default?: boolean
          full_name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          category_id: string | null
          price_cents: number
          compare_at_price_cents: number | null
          cost_cents: number | null
          sku: string | null
          stock_quantity: number
          track_inventory: boolean
          allow_backorder: boolean
          weight_oz: number | null
          dimensions_inches: Json | null
          material: string | null
          color: string | null
          print_time_hours: number | null
          images: ProductImage[]
          is_active: boolean
          is_featured: boolean
          badge: string | null
          stripe_product_id: string | null
          stripe_price_id: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          price_cents: number
          compare_at_price_cents?: number | null
          cost_cents?: number | null
          sku?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          allow_backorder?: boolean
          weight_oz?: number | null
          dimensions_inches?: Json | null
          material?: string | null
          color?: string | null
          print_time_hours?: number | null
          images?: ProductImage[]
          is_active?: boolean
          is_featured?: boolean
          badge?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          price_cents?: number
          compare_at_price_cents?: number | null
          cost_cents?: number | null
          sku?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          allow_backorder?: boolean
          weight_oz?: number | null
          dimensions_inches?: Json | null
          material?: string | null
          color?: string | null
          print_time_hours?: number | null
          images?: ProductImage[]
          is_active?: boolean
          is_featured?: boolean
          badge?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_email: string | null
          status: OrderStatus
          payment_status: PaymentStatus
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal_cents: number
          discount_cents: number
          shipping_cents: number
          tax_cents: number
          total_cents: number
          shipping_method: string | null
          shipping_carrier: string | null
          tracking_number: string | null
          tracking_url: string | null
          estimated_delivery: string | null
          shipped_at: string | null
          delivered_at: string | null
          shipping_address: Json
          billing_address: Json | null
          notes: string | null
          admin_notes: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          status?: OrderStatus
          payment_status?: PaymentStatus
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          discount_cents?: number
          shipping_cents?: number
          tax_cents?: number
          total_cents?: number
          shipping_method?: string | null
          shipping_carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          estimated_delivery?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          shipping_address: Json
          billing_address?: Json | null
          notes?: string | null
          admin_notes?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          status?: OrderStatus
          payment_status?: PaymentStatus
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          discount_cents?: number
          shipping_cents?: number
          tax_cents?: number
          total_cents?: number
          shipping_method?: string | null
          shipping_carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          estimated_delivery?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          shipping_address?: Json
          billing_address?: Json | null
          notes?: string | null
          admin_notes?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          product_image: string | null
          quantity: number
          unit_price_cents: number
          total_cents: number
          print_status: PrintStatus
          print_started_at: string | null
          print_completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          product_image?: string | null
          quantity: number
          unit_price_cents: number
          total_cents: number
          print_status?: PrintStatus
          print_started_at?: string | null
          print_completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          product_image?: string | null
          quantity?: number
          unit_price_cents?: number
          total_cents?: number
          print_status?: PrintStatus
          print_started_at?: string | null
          print_completed_at?: string | null
          created_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: OrderStatus
          note: string | null
          changed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: OrderStatus
          note?: string | null
          changed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: OrderStatus
          note?: string | null
          changed_by?: string | null
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          minimum_order_cents: number | null
          maximum_uses: number | null
          current_uses: number
          starts_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          minimum_order_cents?: number | null
          maximum_uses?: number | null
          current_uses?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          minimum_order_cents?: number | null
          maximum_uses?: number | null
          current_uses?: number
          starts_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      shipping_rates: {
        Row: {
          id: string
          name: string
          description: string | null
          carrier: string | null
          min_weight_oz: number | null
          max_weight_oz: number | null
          min_order_cents: number | null
          max_order_cents: number | null
          rate_cents: number
          estimated_days_min: number | null
          estimated_days_max: number | null
          is_active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          carrier?: string | null
          min_weight_oz?: number | null
          max_weight_oz?: number | null
          min_order_cents?: number | null
          max_order_cents?: number | null
          rate_cents: number
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          carrier?: string | null
          min_weight_oz?: number | null
          max_weight_oz?: number | null
          min_order_cents?: number | null
          max_order_cents?: number | null
          rate_cents?: number
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          is_active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
    }
    Enums: {
      order_status: OrderStatus
      payment_status: PaymentStatus
    }
  }
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'printing'
  | 'quality_check'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export type PrintStatus =
  | 'pending'
  | 'queued'
  | 'printing'
  | 'completed'
  | 'failed'

export type ProductImage = {
  url: string
  alt?: string
  is_primary?: boolean
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type Address = Tables<'addresses'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type OrderStatusHistory = Tables<'order_status_history'>
export type Coupon = Tables<'coupons'>
export type CartItem = Tables<'cart_items'>
export type ShippingRate = Tables<'shipping_rates'>
export type SiteSetting = Tables<'site_settings'>

// Extended types with relations
export type ProductWithCategory = Product & {
  category: Category | null
}

export type OrderWithItems = Order & {
  order_items: OrderItem[]
  profile?: Profile | null
}

export type OrderItemWithProduct = OrderItem & {
  product: Product | null
}
