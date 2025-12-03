-- ============================================
-- ORDERS SYSTEM
-- ============================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  
  -- Delivery Address
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  landmark TEXT,
  
  -- Order Details
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  
  -- Notes
  order_note TEXT,
  admin_note TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled')),
  CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('cod', 'esewa', 'khalti', 'bank_transfer')),
  CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('unpaid', 'paid', 'refunded'))
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Product Details (snapshot at time of order)
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Create updated_at trigger for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
DROP POLICY IF EXISTS "Allow authenticated users to manage orders" ON orders;
CREATE POLICY "Allow authenticated users to manage orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public to create orders" ON orders;
CREATE POLICY "Allow public to create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Allow authenticated users to manage order items" ON order_items;
CREATE POLICY "Allow authenticated users to manage order items"
  ON order_items FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public to create order items" ON order_items;
CREATE POLICY "Allow public to create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get today's date in YYYYMMDD format
  new_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get count of orders today
  SELECT COUNT(*) INTO counter
  FROM orders
  WHERE order_number LIKE new_number || '%';
  
  -- Append counter with leading zeros
  new_number := new_number || LPAD((counter + 1)::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
