-- ============================================
-- Promo Codes Table
-- ============================================
-- Run this in Supabase SQL Editor

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2), -- For percentage discounts, cap the maximum discount
  usage_limit INTEGER, -- Total number of times this code can be used (NULL = unlimited)
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT promo_codes_discount_positive CHECK (discount_value > 0),
  CONSTRAINT promo_codes_percentage_max CHECK (
    discount_type != 'percentage' OR discount_value <= 100
  )
);

-- Index for code lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Public can read active promo codes (for validation)
CREATE POLICY "Anyone can validate promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (is_admin_or_staff());

-- Trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_order_amount DECIMAL
)
RETURNS TABLE (
  valid BOOLEAN,
  promo_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  v_promo RECORD;
  v_discount_amount DECIMAL;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE UPPER(code) = UPPER(p_code)
  AND is_active = true;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if code has started
  IF v_promo.starts_at IS NOT NULL AND v_promo.starts_at > NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'This promo code is not yet active'::TEXT;
    RETURN;
  END IF;
  
  -- Check if code has expired
  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'This promo code has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_promo.usage_limit IS NOT NULL AND v_promo.used_count >= v_promo.usage_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 'This promo code has reached its usage limit'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum order amount
  IF v_promo.min_order_amount IS NOT NULL AND p_order_amount < v_promo.min_order_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, NULL::DECIMAL, 
      ('Minimum order amount is ' || v_promo.min_order_amount)::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount_amount := p_order_amount * (v_promo.discount_value / 100);
    -- Apply max discount cap if set
    IF v_promo.max_discount_amount IS NOT NULL AND v_discount_amount > v_promo.max_discount_amount THEN
      v_discount_amount := v_promo.max_discount_amount;
    END IF;
  ELSE
    v_discount_amount := v_promo.discount_value;
    -- Don't discount more than order amount
    IF v_discount_amount > p_order_amount THEN
      v_discount_amount := p_order_amount;
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    true,
    v_promo.id,
    v_promo.discount_type,
    v_promo.discount_value,
    v_discount_amount,
    'Promo code applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment promo code usage by ID
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_promo_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1
  WHERE id = p_promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment promo code usage by code string
CREATE OR REPLACE FUNCTION increment_promo_code_usage_by_code(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1
  WHERE UPPER(code) = UPPER(p_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the table was created
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'promo_codes'
ORDER BY ordinal_position;
