-- ============================================
-- Update orders status constraint to include 'shipping'
-- ============================================

-- Fix any invalid status values before updating constraint
UPDATE orders SET status = 'pending' 
WHERE status NOT IN ('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled');

-- Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the updated constraint with 'shipping' included
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'));
