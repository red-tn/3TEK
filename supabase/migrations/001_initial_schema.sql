-- 3TEK Design Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/zvvyqepmojhseftnvlfc/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100),
  weight_grams INTEGER,
  dimensions JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'US',
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER DEFAULT 0,
  tax_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  coupon_code VARCHAR(100),
  notes TEXT,
  tracking_number VARCHAR(255),
  tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipping rates table
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  min_order_cents INTEGER DEFAULT 0,
  max_order_cents INTEGER,
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL, -- cents for fixed, percentage for percentage
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read/update their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Addresses: Users can manage their own addresses
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update orders" ON orders FOR UPDATE USING (true);

-- Order items: Users can view items from their orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Products: Anyone can read active products
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access to products" ON products FOR ALL USING (true);

-- Categories: Anyone can read active categories
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access to categories" ON categories FOR ALL USING (true);

-- Shipping rates: Anyone can read active rates
CREATE POLICY "Anyone can view active shipping rates" ON shipping_rates FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access to shipping" ON shipping_rates FOR ALL USING (true);

-- Coupons: Anyone can read active coupons (for validation)
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access to coupons" ON coupons FOR ALL USING (true);

-- Store settings: Anyone can read
CREATE POLICY "Anyone can view store settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Service role full access to settings" ON store_settings FOR ALL USING (true);

-- Contact messages: Anyone can insert
CREATE POLICY "Anyone can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access to messages" ON contact_messages FOR ALL USING (true);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON shipping_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Functional', 'functional', 'Practical 3D printed items for everyday use', 1),
  ('Creative', 'creative', 'Artistic and decorative 3D printed pieces', 2),
  ('Tech', 'tech', 'Technology accessories and gadgets', 3),
  ('Art', 'art', 'Sculptural and artistic 3D printed works', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert default shipping rates
INSERT INTO shipping_rates (name, description, price_cents, estimated_days_min, estimated_days_max) VALUES
  ('Standard Shipping', 'Delivered in 5-7 business days', 599, 5, 7),
  ('Express Shipping', 'Delivered in 2-3 business days', 1299, 2, 3),
  ('Free Shipping', 'Free shipping on orders over $50', 0, 5, 7)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, price_cents, category_id, is_featured, stock_quantity, images) VALUES
  ('Geometric Desk Organizer', 'geometric-desk-organizer', 'A sleek, modern desk organizer with a cyberpunk-inspired geometric design. Perfect for holding pens, cards, and small accessories.', 2999, (SELECT id FROM categories WHERE slug = 'functional'), true, 50, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800']),
  ('Neon Phone Stand', 'neon-phone-stand', 'Adjustable phone stand with industrial aesthetics. Features cable management and multiple viewing angles.', 1999, (SELECT id FROM categories WHERE slug = 'tech'), true, 75, ARRAY['https://images.unsplash.com/photo-1544866092-1935c5ef2a8f?w=800']),
  ('Abstract Wave Sculpture', 'abstract-wave-sculpture', 'A stunning abstract sculpture that captures the essence of digital waves. Makes a perfect centerpiece.', 4999, (SELECT id FROM categories WHERE slug = 'art'), true, 25, ARRAY['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800']),
  ('Modular Wall Planter', 'modular-wall-planter', 'Stackable wall planters with a futuristic honeycomb design. Create your own living wall art.', 2499, (SELECT id FROM categories WHERE slug = 'creative'), true, 100, ARRAY['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800']),
  ('Cable Management Box', 'cable-management-box', 'Keep your cables organized with this industrial-style cable box. Features ventilation slots and multiple entry points.', 3499, (SELECT id FROM categories WHERE slug = 'tech'), false, 60, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']),
  ('Geometric Bookends', 'geometric-bookends', 'Set of two geometric bookends with a bold, architectural design. Heavy-duty and stable.', 3999, (SELECT id FROM categories WHERE slug = 'functional'), false, 40, ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'])
ON CONFLICT (slug) DO NOTHING;

SELECT 'Database setup complete!' as status;
