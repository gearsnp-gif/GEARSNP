# 🗄️ GearsNP Database Setup Guide

Complete guide for setting up the Supabase database for GearsNP.

## 📋 Prerequisites

- Supabase account (free tier is sufficient)
- Basic understanding of SQL
- Access to Supabase Dashboard

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details:
   - **Name**: GearsNP
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
4. Wait for project initialization (~2 minutes)

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy these values to your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

### 3. Execute SQL Files

Execute the SQL files in order in the Supabase SQL Editor:

1. Go to SQL Editor in Supabase Dashboard
2. Click "New Query"
3. Copy-paste and execute in this exact order:

#### Step 1: Schema (Tables, Indexes, Triggers)
```bash
# File: supabase/01_schema.sql
```
- Creates all database tables
- Sets up indexes for performance
- Creates triggers for auto-updating timestamps
- Auto-generates order numbers

#### Step 2: RLS Policies (Security)
```bash
# File: supabase/02_rls_policies.sql
```
- Enables Row Level Security
- Creates admin helper function
- Sets up public read, admin write policies
- Enables guest checkout

#### Step 3: Storage Buckets (Images)
```bash
# File: supabase/03_storage.sql
```
- Creates image storage buckets
- Sets up public read access
- Configures file size limits
- Sets allowed MIME types

#### Step 4: Seed Data (Sample Data)
```bash
# File: supabase/04_seed_data.sql
```
- Adds sample categories
- Adds F1 teams with colors
- Adds sample products
- Adds sample events
- Sets default settings

### 4. Create Admin User

1. Go to Authentication → Users in Supabase Dashboard
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: your-admin-email@example.com
   - Password: (create a strong password)
   - Email Confirm: ✓ (check this)
4. Click "Create User"

5. Make user an admin by running in SQL Editor:
   ```sql
   SELECT make_user_admin('your-admin-email@example.com');
   ```

### 5. Verify Setup

Run these verification queries in SQL Editor:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected: 10 tables
-- categories, deliveries, events, order_items, orders,
-- product_images, products, profiles, settings, teams

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show: true

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Expected: 3 buckets
-- product-images, team-logos, event-banners

-- Check seed data
SELECT 'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Teams', COUNT(*) FROM teams
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Events', COUNT(*) FROM events;

-- Expected counts:
-- Categories: 5
-- Teams: 6
-- Products: 8
-- Events: 3
```

---

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|-------------|
| **profiles** | User management | Linked to auth.users, role-based access |
| **categories** | Product categories | Slugs, sort order, active status |
| **teams** | F1 Teams | Team colors, logos, descriptions |
| **products** | Product catalog | Prices, stock, images, featured flag |
| **product_images** | Product gallery | Multiple images per product |
| **events** | F1 Events | Watch parties, meetups, races |
| **orders** | Customer orders | Guest checkout supported |
| **order_items** | Order line items | Product snapshots |
| **deliveries** | Shipping tracking | Status tracking, provider info |
| **settings** | Site configuration | Single-row global settings |

### Relationships

```
categories ←→ products (many-to-one)
teams ←→ products (many-to-one)
products ←→ product_images (one-to-many)
orders ←→ order_items (one-to-many)
orders ←→ deliveries (one-to-one)
auth.users ←→ profiles (one-to-one)
auth.users ←→ orders (one-to-many, optional)
```

---

## 🔒 Security (RLS Policies)

### Public Read Tables
- ✓ categories
- ✓ teams
- ✓ products (is_active = true)
- ✓ product_images
- ✓ events (is_active = true)
- ✓ settings

### Guest Allowed
- ✓ orders (INSERT only)
- ✓ order_items (INSERT only)

### Admin/Staff Only
- ✓ All INSERT/UPDATE/DELETE operations
- ✓ Full access to all tables
- ✓ Delivery management
- ✓ Order status updates

### Role-Based Function
```sql
is_admin_or_staff()
-- Returns true if current user has role = 'admin' or 'staff'
-- Used in all RLS policies for admin access
```

---

## 💾 Storage Configuration

### Buckets Created

1. **product-images**
   - Max size: 5MB
   - Types: JPEG, PNG, WebP, GIF
   - Public read access

2. **team-logos**
   - Max size: 2MB
   - Types: JPEG, PNG, WebP, SVG
   - Public read access

3. **event-banners**
   - Max size: 5MB
   - Types: JPEG, PNG, WebP
   - Public read access

### Upload Example

```typescript
// Upload product image
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`products/${productId}/${file.name}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(data.path);
```

---

## 🎯 Common Operations

### Create Admin User (SQL)
```sql
SELECT make_user_admin('user@example.com');
```

### Add New Category
```sql
INSERT INTO categories (name, slug, description, sort_order)
VALUES ('New Category', 'new-category', 'Description', 10);
```

### Add New Team
```sql
INSERT INTO teams (name, slug, primary_color, secondary_color)
VALUES ('Team Name', 'team-slug', '#FF0000', '#FFFFFF');
```

### Create Product
```sql
INSERT INTO products (
  name, slug, category_id, team_id,
  base_price, stock, is_active
)
VALUES (
  'Product Name',
  'product-slug',
  (SELECT id FROM categories WHERE slug = 'category-slug'),
  (SELECT id FROM teams WHERE slug = 'team-slug'),
  2999.00,
  100,
  true
);
```

### Update Order Status
```sql
UPDATE orders 
SET status = 'confirmed', payment_status = 'paid'
WHERE order_number = 'GNP-20241202-1234';
```

---

## 🔧 Troubleshooting

### Issue: RLS Blocking Admin Access

**Solution**: Ensure admin user has correct role:
```sql
-- Check current role
SELECT role FROM profiles WHERE id = auth.uid();

-- Update to admin
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

### Issue: Storage Upload Fails

**Solution**: Check bucket policies:
```sql
-- Re-run storage policies from 03_storage.sql
-- Or manually add policies in Storage → Policies
```

### Issue: Guest Checkout Not Working

**Solution**: Verify INSERT policy on orders:
```sql
-- Should allow anyone to INSERT
SELECT * FROM pg_policies 
WHERE tablename = 'orders' 
AND cmd = 'INSERT';
```

### Issue: Products Not Showing

**Solution**: Check is_active flag:
```sql
-- View all products
SELECT id, name, is_active FROM products;

-- Activate product
UPDATE products SET is_active = true WHERE slug = 'product-slug';
```

---

## 📈 Performance Optimization

### Indexes Created
- ✓ All foreign keys indexed
- ✓ Slug fields indexed (categories, teams, products, events)
- ✓ Status fields indexed (orders, deliveries)
- ✓ Created_at indexed for sorting
- ✓ Featured/active flags indexed

### Query Optimization Tips

1. **Use indexes**:
   ```sql
   -- Good (uses index)
   SELECT * FROM products WHERE slug = 'product-slug';
   
   -- Bad (full table scan)
   SELECT * FROM products WHERE LOWER(name) LIKE '%search%';
   ```

2. **Limit results**:
   ```typescript
   const { data } = await supabase
     .from('products')
     .select('*')
     .limit(20);
   ```

3. **Select only needed fields**:
   ```typescript
   // Good
   .select('id, name, base_price')
   
   // Avoid
   .select('*')
   ```

---

## 🔄 Backup & Maintenance

### Automated Backups
- Supabase automatically backs up daily
- Backups retained for 7 days (free tier)
- Access via: Settings → Database → Backups

### Manual Backup
```bash
# Dump database
pg_dump -h [supabase-host] -U postgres [database-name] > backup.sql

# Restore
psql -h [supabase-host] -U postgres [database-name] < backup.sql
```

### Maintenance Tasks

**Weekly**:
- Check for abandoned carts (old unpaid orders)
- Review low-stock products
- Monitor failed deliveries

**Monthly**:
- Archive old orders
- Review and optimize slow queries
- Check storage usage

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## ✅ Setup Checklist

- [ ] Supabase project created
- [ ] API credentials added to `.env.local`
- [ ] Schema SQL executed (01_schema.sql)
- [ ] RLS policies created (02_rls_policies.sql)
- [ ] Storage buckets configured (03_storage.sql)
- [ ] Seed data loaded (04_seed_data.sql)
- [ ] Admin user created
- [ ] Admin role assigned
- [ ] Verification queries passed
- [ ] Test product visible on storefront
- [ ] Test admin login works
- [ ] Test guest checkout works

---

**Setup Complete!** 🎉

Your GearsNP database is ready for development.

Next steps:
1. Start dev server: `npm run dev`
2. Test storefront: http://localhost:3000
3. Test admin: http://localhost:3000/admin/login
4. Begin building features!
