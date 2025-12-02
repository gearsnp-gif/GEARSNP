-- ============================================
-- GearsNP Database Schema - Part 4: Seed Data
-- ============================================
-- Execute this file after 03_storage.sql
-- Run in Supabase SQL Editor

-- ============================================
-- 1. CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('T-Shirts', 't-shirts', 'Premium F1 team t-shirts and racing apparel', 1, true),
('Hoodies', 'hoodies', 'Warm hoodies featuring your favorite F1 teams', 2, true),
('Accessories', 'accessories', 'Caps, bags, keychains and more F1 merchandise', 3, true),
('Caps', 'caps', 'Official F1 team caps and hats', 4, true),
('Jackets', 'jackets', 'Racing jackets and team outerwear', 5, true);

-- ============================================
-- 2. TEAMS
-- ============================================

INSERT INTO teams (name, slug, description, primary_color, secondary_color, is_active, sort_order) VALUES
('Red Bull Racing', 'red-bull-racing', 'Oracle Red Bull Racing - Championship contenders with Max Verstappen', '#0600EF', '#FFB800', true, 1),
('Scuderia Ferrari', 'ferrari', 'The legendary Italian team with a rich F1 history', '#DC0000', '#FFF200', true, 2),
('Mercedes-AMG Petronas', 'mercedes', 'Silver Arrows - Multiple championship winners', '#00D2BE', '#000000', true, 3),
('McLaren F1 Team', 'mclaren', 'Historic British racing team in papaya orange', '#FF8700', '#47C7FC', true, 4),
('Aston Martin Aramco', 'aston-martin', 'British luxury and performance in racing green', '#006F62', '#CEDC00', true, 5),
('BWT Alpine F1 Team', 'alpine', 'French racing excellence in blue and pink', '#0090FF', '#FF87BC', true, 6);

-- ============================================
-- 3. PRODUCTS
-- ============================================

INSERT INTO products (name, slug, sku, category_id, team_id, short_description, description, base_price, compare_at_price, is_featured, is_active, stock) VALUES
(
  'Red Bull Racing 2024 Team T-Shirt',
  'red-bull-racing-2024-team-t-shirt',
  'RBR-TS-001',
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  (SELECT id FROM teams WHERE slug = 'red-bull-racing'),
  'Official Red Bull Racing team t-shirt',
  'Show your support for the reigning champions with this premium Red Bull Racing team t-shirt. Made from high-quality cotton with official team branding.',
  2999.00,
  3499.00,
  true,
  true,
  50
),
(
  'Ferrari Scuderia Hoodie',
  'ferrari-scuderia-hoodie',
  'FER-HD-001',
  (SELECT id FROM categories WHERE slug = 'hoodies'),
  (SELECT id FROM teams WHERE slug = 'ferrari'),
  'Premium Ferrari team hoodie',
  'Stay warm in style with this official Scuderia Ferrari hoodie. Features the iconic prancing horse logo and team colors.',
  4999.00,
  5999.00,
  true,
  true,
  30
),
(
  'Mercedes-AMG Petronas Team Cap',
  'mercedes-amg-team-cap',
  'MER-CAP-001',
  (SELECT id FROM categories WHERE slug = 'caps'),
  (SELECT id FROM teams WHERE slug = 'mercedes'),
  'Official Mercedes-AMG team cap',
  'Premium team cap featuring the Mercedes-AMG Petronas F1 Team logo. Adjustable fit with embroidered details.',
  1999.00,
  NULL,
  true,
  true,
  75
),
(
  'McLaren Racing Team Jacket',
  'mclaren-racing-team-jacket',
  'MCL-JKT-001',
  (SELECT id FROM categories WHERE slug = 'jackets'),
  (SELECT id FROM teams WHERE slug = 'mclaren'),
  'McLaren papaya racing jacket',
  'Stand out with the iconic McLaren papaya orange racing jacket. Official team merchandise with premium quality.',
  7999.00,
  8999.00,
  false,
  true,
  20
),
(
  'Aston Martin Racing Backpack',
  'aston-martin-racing-backpack',
  'AST-BAG-001',
  (SELECT id FROM categories WHERE slug = 'accessories'),
  (SELECT id FROM teams WHERE slug = 'aston-martin'),
  'Official team backpack',
  'Spacious and stylish Aston Martin F1 team backpack. Perfect for carrying your gear with team pride.',
  3499.00,
  NULL,
  false,
  true,
  40
),
(
  'Alpine F1 Team T-Shirt',
  'alpine-f1-team-t-shirt',
  'ALP-TS-001',
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  (SELECT id FROM teams WHERE slug = 'alpine'),
  'Alpine F1 racing t-shirt',
  'Official Alpine F1 Team t-shirt in signature blue and pink colors. Comfortable fit for everyday wear.',
  2799.00,
  NULL,
  false,
  true,
  60
),
(
  'Red Bull Racing Cap',
  'red-bull-racing-cap',
  'RBR-CAP-001',
  (SELECT id FROM categories WHERE slug = 'caps'),
  (SELECT id FROM teams WHERE slug = 'red-bull-racing'),
  'Championship winning team cap',
  'Show your support for Max Verstappen and Red Bull Racing with this official team cap.',
  1899.00,
  2299.00,
  true,
  true,
  100
),
(
  'Ferrari Scuderia T-Shirt',
  'ferrari-scuderia-t-shirt',
  'FER-TS-001',
  (SELECT id FROM categories WHERE slug = 't-shirts'),
  (SELECT id FROM teams WHERE slug = 'ferrari'),
  'Classic Ferrari team t-shirt',
  'Iconic Scuderia Ferrari t-shirt with prancing horse logo. A must-have for any Ferrari fan.',
  2899.00,
  NULL,
  true,
  true,
  80
);

-- ============================================
-- 4. EVENTS
-- ============================================

INSERT INTO events (title, slug, description, location, event_date, is_active) VALUES
(
  'Monaco Grand Prix Watch Party 2024',
  'monaco-gp-watch-party-2024',
  'Join us for the most glamorous race of the season! Watch the Monaco Grand Prix on big screens with fellow F1 fans. Food, drinks, and great company guaranteed.',
  'GearsNP Headquarters, Kathmandu',
  '2024-05-26 13:00:00+00',
  true
),
(
  'British Grand Prix Meetup',
  'british-gp-meetup-2024',
  'Celebrate British racing heritage at Silverstone! Join us for a watch party with exclusive merchandise giveaways.',
  'The Racing Hub, Patan',
  '2024-07-07 13:00:00+00',
  true
),
(
  'Italian Grand Prix - Monza Special',
  'italian-gp-monza-2024',
  'Experience the passion of Monza with us! Watch the Italian Grand Prix and celebrate with Ferrari fans.',
  'GearsNP Store, Thamel',
  '2024-09-01 12:30:00+00',
  true
);

-- ============================================
-- 5. SETTINGS
-- ============================================

UPDATE settings SET
  site_name = 'GearsNP',
  hero_title = 'Premium F1 Merchandise',
  hero_subtitle = 'Shop Official Team Gear & Racing Apparel',
  promo_text = '🏎️ Free Shipping on Orders Over NPR 5,000 | Same Day Delivery in Kathmandu Valley',
  primary_color = '#dc2626',
  secondary_color = '#3b82f6',
  support_phone = '+977-1-XXXXXXX',
  support_email = 'support@gearsnp.com',
  instagram_url = 'https://instagram.com/gearsnp',
  tiktok_url = 'https://tiktok.com/@gearsnp'
WHERE id = 1;

-- ============================================
-- 6. CREATE ADMIN USER HELPER
-- ============================================
-- Run this function after creating your first user via Supabase Auth

CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert or update profile
  INSERT INTO profiles (id, full_name, role)
  VALUES (user_id, 'Admin User', 'admin')
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin';
  
  RAISE NOTICE 'User % is now an admin', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Usage Instructions:
-- ============================================
-- After creating a user in Supabase Auth Dashboard, run:
-- SELECT make_user_admin('your-email@example.com');
-- ============================================

-- ============================================
-- Seed data complete!
-- Database is ready for use!
-- ============================================

-- Quick verification queries:
-- SELECT COUNT(*) as total_categories FROM categories;
-- SELECT COUNT(*) as total_teams FROM teams;
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT COUNT(*) as total_events FROM events;
-- SELECT * FROM settings;
