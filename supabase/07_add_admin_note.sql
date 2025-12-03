-- Add admin_note column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
