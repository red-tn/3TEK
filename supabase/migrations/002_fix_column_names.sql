-- Fix column name mismatch
-- Run this in Supabase SQL Editor

-- Rename stripe_session_id to stripe_checkout_session_id if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'stripe_session_id') THEN
    ALTER TABLE orders RENAME COLUMN stripe_session_id TO stripe_checkout_session_id;
  END IF;
END $$;

-- Add columns if they don't exist (for checkout flow)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add columns for order_items that might be missing
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price_cents INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_cents INTEGER;

-- Update order_items to use price_cents as fallback
UPDATE order_items SET unit_price_cents = price_cents WHERE unit_price_cents IS NULL;
UPDATE order_items SET total_cents = price_cents * quantity WHERE total_cents IS NULL;

SELECT 'Column fixes applied!' as status;
