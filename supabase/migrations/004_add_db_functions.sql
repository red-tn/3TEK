-- Database functions for order processing

-- Function to decrement stock (if not exists)
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(0, stock_quantity - quantity),
      updated_at = NOW()
  WHERE id = product_id
    AND track_inventory = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add track_inventory column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'track_inventory'
  ) THEN
    ALTER TABLE products ADD COLUMN track_inventory BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add starts_at column to coupons if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'starts_at'
  ) THEN
    ALTER TABLE coupons ADD COLUMN starts_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add stripe_session_id column to orders if using different name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'stripe_checkout_session_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
    ) THEN
      ALTER TABLE orders RENAME COLUMN stripe_session_id TO stripe_checkout_session_id;
    ELSE
      ALTER TABLE orders ADD COLUMN stripe_checkout_session_id VARCHAR(255);
    END IF;
  END IF;
END $$;

-- Ensure coupon_code column exists in orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(100);
  END IF;
END $$;
