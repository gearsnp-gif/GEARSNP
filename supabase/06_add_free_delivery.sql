-- ============================================
-- Add Free Delivery Column to Products
-- ============================================
-- Run this in Supabase SQL Editor

-- Add free_delivery column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS free_delivery BOOLEAN NOT NULL DEFAULT false;

-- Create index for filtering free delivery products
CREATE INDEX IF NOT EXISTS idx_products_free_delivery ON products(free_delivery) WHERE free_delivery = true;

-- Optional: Set specific products to have free delivery
-- UPDATE products SET free_delivery = true WHERE base_price >= 5000;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'free_delivery';
