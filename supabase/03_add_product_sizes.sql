-- ============================================
-- ADD PRODUCT SIZES/VARIANTS TABLE
-- ============================================
-- For apparel sizing (S, M, L, XL, etc.)

-- First, add has_sizes column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_sizes BOOLEAN DEFAULT false;

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL, -- e.g., "S", "M", "L", "XL", "XXL", "XXXL"
  stock INTEGER NOT NULL DEFAULT 0,
  price_modifier DECIMAL(10, 2) DEFAULT 0, -- Additional price for this size (usually 0)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT product_variants_stock_positive CHECK (stock >= 0),
  CONSTRAINT product_variants_unique_size UNIQUE(product_id, size)
);

-- Index for product lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active) WHERE is_active = true;

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public read access to active product variants" ON product_variants;
CREATE POLICY "Allow public read access to active product variants"
  ON product_variants FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Allow authenticated users to manage product variants" ON product_variants;
CREATE POLICY "Allow authenticated users to manage product variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
