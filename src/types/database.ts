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
          email: string | null
          full_name: string | null
          phone: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          name: string
          line1: string
          line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          line1: string
          line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string | null
          is_default?: boolean
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
          price_cents: number
          compare_at_price_cents: number | null
          category_id: string | null
          images: string[]
          is_active: boolean
          is_featured: boolean
          stock_quantity: number
          sku: string | null
          weight_grams: number | null
          dimensions: Json | null
          metadata: Json
          created_at: string
          updated_at: string
          // Extended fields (add via migration if needed)
          short_description?: string | null
          track_inventory?: boolean
          badge?: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price_cents: number
          compare_at_price_cents?: number | null
          category_id?: string | null
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          stock_quantity?: number
          sku?: string | null
          weight_grams?: number | null
          dimensions?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          short_description?: string | null
          track_inventory?: boolean
          badge?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price_cents?: number
          compare_at_price_cents?: number | null
          category_id?: string | null
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          stock_quantity?: number
          sku?: string | null
          weight_grams?: number | null
          dimensions?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          short_description?: string | null
          track_inventory?: boolean
          badge?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          email: string
          status: string
          payment_status: string
          subtotal_cents: number
          shipping_cents: number
          tax_cents: number
          discount_cents: number
          total_cents: number
          shipping_address: Json
          billing_address: Json | null
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          coupon_code: string | null
          notes: string | null
          tracking_number: string | null
          tracking_url: string | null
          shipped_at: string | null
          delivered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          email: string
          status?: string
          payment_status?: string
          subtotal_cents: number
          shipping_cents?: number
          tax_cents?: number
          discount_cents?: number
          total_cents: number
          shipping_address: Json
          billing_address?: Json | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          coupon_code?: string | null
          notes?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          email?: string
          status?: string
          payment_status?: string
          subtotal_cents?: number
          shipping_cents?: number
          tax_cents?: number
          discount_cents?: number
          total_cents?: number
          shipping_address?: Json
          billing_address?: Json | null
          stripe_session_id?: string | null
          stripe_payment_intent_id?: string | null
          coupon_code?: string | null
          notes?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
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
          product_image: string | null
          quantity: number
          price_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          quantity: number
          price_cents: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_image?: string | null
          quantity?: number
          price_cents?: number
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: string
          discount_value: number
          min_order_cents: number
          max_uses: number | null
          current_uses: number
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: string
          discount_value: number
          min_order_cents?: number
          max_uses?: number | null
          current_uses?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          min_order_cents?: number
          max_uses?: number | null
          current_uses?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      shipping_rates: {
        Row: {
          id: string
          name: string
          description: string | null
          price_cents: number
          min_order_cents: number
          max_order_cents: number | null
          estimated_days_min: number | null
          estimated_days_max: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_cents: number
          min_order_cents?: number
          max_order_cents?: number | null
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_cents?: number
          min_order_cents?: number
          max_order_cents?: number | null
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      store_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Order status values
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

// Payment status values
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type ShippingRate = Database['public']['Tables']['shipping_rates']['Row']
export type StoreSetting = Database['public']['Tables']['store_settings']['Row']
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row']

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
