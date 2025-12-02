-- Add logo and favicon columns to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT;
