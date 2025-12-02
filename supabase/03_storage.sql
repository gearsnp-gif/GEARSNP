-- ============================================
-- GearsNP Database Schema - Part 3: Storage Buckets
-- ============================================
-- Execute this file after 02_rls_policies.sql
-- Run in Supabase SQL Editor

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- 1. Product Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Team Logos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-logos',
  'team-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- 3. Event Banners Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-banners',
  'event-banners',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- ============================================
-- Product Images Policies
-- ============================================

-- Anyone can read product images
CREATE POLICY "Anyone can read product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Admin/staff can upload product images
CREATE POLICY "Admin/staff can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND is_admin_or_staff()
  );

-- Admin/staff can update product images
CREATE POLICY "Admin/staff can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND is_admin_or_staff()
  );

-- Admin/staff can delete product images
CREATE POLICY "Admin/staff can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND is_admin_or_staff()
  );

-- ============================================
-- Team Logos Policies
-- ============================================

-- Anyone can read team logos
CREATE POLICY "Anyone can read team logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'team-logos');

-- Admin/staff can upload team logos
CREATE POLICY "Admin/staff can upload team logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'team-logos'
    AND is_admin_or_staff()
  );

-- Admin/staff can update team logos
CREATE POLICY "Admin/staff can update team logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'team-logos'
    AND is_admin_or_staff()
  );

-- Admin/staff can delete team logos
CREATE POLICY "Admin/staff can delete team logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'team-logos'
    AND is_admin_or_staff()
  );

-- ============================================
-- Event Banners Policies
-- ============================================

-- Anyone can read event banners
CREATE POLICY "Anyone can read event banners"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-banners');

-- Admin/staff can upload event banners
CREATE POLICY "Admin/staff can upload event banners"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'event-banners'
    AND is_admin_or_staff()
  );

-- Admin/staff can update event banners
CREATE POLICY "Admin/staff can update event banners"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'event-banners'
    AND is_admin_or_staff()
  );

-- Admin/staff can delete event banners
CREATE POLICY "Admin/staff can delete event banners"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'event-banners'
    AND is_admin_or_staff()
  );

-- ============================================
-- Storage setup complete!
-- Next: Run 04_seed_data.sql
-- ============================================
