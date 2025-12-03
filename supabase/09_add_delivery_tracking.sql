-- Add delivery tracking columns to orders table

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS gaaubesi_order_id TEXT,
ADD COLUMN IF NOT EXISTS sent_to_delivery_at TIMESTAMPTZ;

-- Create index for gaaubesi_order_id
CREATE INDEX IF NOT EXISTS idx_orders_gaaubesi_order_id ON orders(gaaubesi_order_id);

-- Add comment for documentation
COMMENT ON COLUMN orders.gaaubesi_order_id IS 'Order ID from Gaaubesi delivery service';
COMMENT ON COLUMN orders.sent_to_delivery_at IS 'Timestamp when order was sent to delivery service';
