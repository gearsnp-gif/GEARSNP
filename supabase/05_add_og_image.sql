-- Add og_image_url column to settings table for SEO
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

COMMENT ON COLUMN settings.og_image_url IS 'Open Graph image URL for social media sharing (1200x630px recommended)';
