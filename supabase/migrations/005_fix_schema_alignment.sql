-- Schema alignment fixes
-- Run this in Supabase SQL Editor

-- Fix orders table: revert stripe_checkout_session_id back to stripe_session_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'stripe_checkout_session_id') THEN
    ALTER TABLE orders RENAME COLUMN stripe_checkout_session_id TO stripe_session_id;
  END IF;
END $$;

-- Drop guest_email column if it exists (we use the email column instead)
ALTER TABLE orders DROP COLUMN IF EXISTS guest_email;

-- Keep payment_status column (used in webhook for tracking payment state)
-- Already added in migration 002, just ensure it exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add missing product columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);

-- Create index for badge if it doesn't exist (useful for filtering featured/sale items)
CREATE INDEX IF NOT EXISTS idx_products_badge ON products(badge) WHERE badge IS NOT NULL;

SELECT 'Schema alignment complete!' as status;
