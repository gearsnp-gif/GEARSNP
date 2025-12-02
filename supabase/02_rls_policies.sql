-- ============================================
-- GearsNP Database Schema - Part 2: RLS Policies
-- ============================================
-- Execute this file after 01_schema.sql
-- Run in Supabase SQL Editor

-- ============================================
-- HELPER FUNCTION: Check if user is admin/staff
-- ============================================

CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Admins can manage all profiles
-- Users can read their own profile

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin/staff can do everything
CREATE POLICY "Admin/staff full access on profiles"
  ON profiles
  FOR ALL
  USING (is_admin_or_staff());

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
-- Public read, admin write

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read active categories
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  USING (true);

-- Only admin/staff can insert
CREATE POLICY "Admin/staff can insert categories"
  ON categories
  FOR INSERT
  WITH CHECK (is_admin_or_staff());

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update categories"
  ON categories
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete categories"
  ON categories
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 3. TEAMS TABLE
-- ============================================
-- Public read, admin write

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Anyone can read active teams
CREATE POLICY "Anyone can read teams"
  ON teams
  FOR SELECT
  USING (true);

-- Only admin/staff can insert
CREATE POLICY "Admin/staff can insert teams"
  ON teams
  FOR INSERT
  WITH CHECK (is_admin_or_staff());

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update teams"
  ON teams
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete teams"
  ON teams
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 4. PRODUCTS TABLE
-- ============================================
-- Public read active products, admin full access

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  USING (is_active = true OR is_admin_or_staff());

-- Only admin/staff can insert
CREATE POLICY "Admin/staff can insert products"
  ON products
  FOR INSERT
  WITH CHECK (is_admin_or_staff());

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update products"
  ON products
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete products"
  ON products
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 5. PRODUCT_IMAGES TABLE
-- ============================================
-- Public read, admin write

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can read product images
CREATE POLICY "Anyone can read product images"
  ON product_images
  FOR SELECT
  USING (true);

-- Only admin/staff can insert
CREATE POLICY "Admin/staff can insert product images"
  ON product_images
  FOR INSERT
  WITH CHECK (is_admin_or_staff());

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update product images"
  ON product_images
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete product images"
  ON product_images
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 6. EVENTS TABLE
-- ============================================
-- Public read active events, admin write

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can read active events
CREATE POLICY "Anyone can read active events"
  ON events
  FOR SELECT
  USING (is_active = true OR is_admin_or_staff());

-- Only admin/staff can insert
CREATE POLICY "Admin/staff can insert events"
  ON events
  FOR INSERT
  WITH CHECK (is_admin_or_staff());

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update events"
  ON events
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete events"
  ON events
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 7. ORDERS TABLE
-- ============================================
-- Guest checkout allowed (INSERT for anyone)
-- Users can read their own orders
-- Admin can read/update all orders

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can create orders (guest checkout)
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR is_admin_or_staff()
  );

-- Only admin/staff can update orders
CREATE POLICY "Admin/staff can update orders"
  ON orders
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete orders
CREATE POLICY "Admin/staff can delete orders"
  ON orders
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 8. ORDER_ITEMS TABLE
-- ============================================
-- Linked to orders, inherit permissions

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Anyone can insert order items (during checkout)
CREATE POLICY "Anyone can create order items"
  ON order_items
  FOR INSERT
  WITH CHECK (true);

-- Users can read their own order items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin_or_staff())
    )
  );

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update order items"
  ON order_items
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete order items"
  ON order_items
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 9. DELIVERIES TABLE
-- ============================================
-- Admin only for full access
-- Users can read their order's delivery

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Only admin/staff can insert
CREATE POLICY "Admin/staff can insert deliveries"
  ON deliveries
  FOR INSERT
  WITH CHECK (is_admin_or_staff());

-- Users can read their own order deliveries
CREATE POLICY "Users can read own deliveries"
  ON deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND (orders.user_id = auth.uid() OR is_admin_or_staff())
    )
  );

-- Only admin/staff can update
CREATE POLICY "Admin/staff can update deliveries"
  ON deliveries
  FOR UPDATE
  USING (is_admin_or_staff());

-- Only admin/staff can delete
CREATE POLICY "Admin/staff can delete deliveries"
  ON deliveries
  FOR DELETE
  USING (is_admin_or_staff());

-- ============================================
-- 10. SETTINGS TABLE
-- ============================================
-- Public read, admin write

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings"
  ON settings
  FOR SELECT
  USING (true);

-- Only admin can update
CREATE POLICY "Admin can update settings"
  ON settings
  FOR UPDATE
  USING (is_admin_or_staff());

-- ============================================
-- RLS Policies complete!
-- Next: Run 03_storage.sql
-- ============================================
