-- ============================================
-- FINAL FIX: Allow guest checkout
-- ============================================
-- Run this on your CORRECT Supabase project

-- Grant permissions to anon role (for guest checkout)
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON orders';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'order_items') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON order_items';
    END LOOP;
END $$;

-- Create simple policies allowing all operations
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('orders', 'order_items');
