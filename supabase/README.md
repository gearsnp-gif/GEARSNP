# 📊 GearsNP Supabase Database

Complete database schema, policies, and setup for GearsNP F1 Merchandise Store.

## 📁 Files in this Directory

| File | Purpose | Execute Order |
|------|---------|---------------|
| `01_schema.sql` | Create all tables, indexes, triggers | 1st |
| `02_rls_policies.sql` | Set up Row Level Security | 2nd |
| `03_storage.sql` | Configure image storage buckets | 3rd |
| `04_seed_data.sql` | Load sample data | 4th |
| `SETUP_GUIDE.md` | Detailed setup instructions | Read first |
| `README.md` | This file | Overview |

## 🚀 Quick Start

```bash
# 1. Create Supabase project at supabase.com

# 2. Get API credentials and add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 3. Execute SQL files in Supabase SQL Editor (in order 1-4)

# 4. Create admin user and assign role:
SELECT make_user_admin('your-email@example.com');

# 5. Done! Start developing
npm run dev
```

## 📊 Database Tables

### 1. **profiles** - User Management
```sql
- id (uuid, FK → auth.users)
- full_name
- role (admin|staff|customer)
- created_at, updated_at
```

### 2. **categories** - Product Categories
```sql
- id, name, slug (unique)
- description
- sort_order, is_active
```

### 3. **teams** - F1 Teams
```sql
- id, name, slug (unique)
- description, logo_url
- primary_color, secondary_color
- is_active, sort_order
```

### 4. **products** - Product Catalog
```sql
- id, name, slug (unique), sku
- category_id, team_id
- short_description, description
- base_price, compare_at_price, currency
- is_featured, is_active, stock
- hero_image_url
```

### 5. **product_images** - Product Gallery
```sql
- id, product_id (FK)
- image_url, sort_order
```

### 6. **events** - F1 Events
```sql
- id, title, slug (unique)
- description, location
- event_date, banner_image_url
- is_active
```

### 7. **orders** - Customer Orders
```sql
- id, order_number (auto-generated)
- user_id (optional - guest checkout)
- status, payment_status
- subtotal, shipping_fee, discount_amount, total
- customer_name, customer_phone, customer_email
- shipping_address, city, delivery_zone
- notes
```

### 8. **order_items** - Order Line Items
```sql
- id, order_id (FK), product_id
- product_name, quantity
- unit_price, total_price
- size, color
```

### 9. **deliveries** - Shipping Tracking
```sql
- id, order_id (FK)
- provider, tracking_code
- status
- estimated_delivery_date, delivered_at
- notes
```

### 10. **settings** - Site Configuration
```sql
- id (single row = 1)
- site_name, hero_title, hero_subtitle
- promo_text, banner_image_url
- primary_color, secondary_color
- support_phone, support_email
- instagram_url, tiktok_url
```

## 🔒 Security Model

### Row Level Security (RLS)

**Public Read** (Anyone can view):
- categories
- teams
- products (is_active = true)
- product_images
- events (is_active = true)
- settings

**Guest Allowed** (Anonymous INSERT):
- orders
- order_items

**Admin/Staff Only** (Full CRUD):
- All tables
- All UPDATE/DELETE operations
- Product management
- Order management
- Delivery tracking

### Role-Based Access
```sql
-- Helper function used by all policies
is_admin_or_staff()
-- Returns true if user.role IN ('admin', 'staff')
```

## 💾 Storage Buckets

### product-images
- Size: 5MB max
- Types: JPEG, PNG, WebP, GIF
- Access: Public read, admin write

### team-logos
- Size: 2MB max
- Types: JPEG, PNG, WebP, SVG
- Access: Public read, admin write

### event-banners
- Size: 5MB max
- Types: JPEG, PNG, WebP
- Access: Public read, admin write

## 🎯 Key Features

### Auto-Generated Order Numbers
```sql
Format: GNP-YYYYMMDD-XXXX
Example: GNP-20241202-1234
```

### Timestamps Auto-Update
All tables with `updated_at` automatically update on changes.

### Guest Checkout
Orders can be created without authentication:
```typescript
// user_id is optional
{ customer_name, customer_phone, shipping_address, ... }
```

### Product Snapshots
Order items store product name/price:
- Products can be deleted without breaking orders
- Price history preserved

### Cascading Deletes
- Delete product → deletes product_images
- Delete order → deletes order_items and deliveries

## 📈 Performance

### Indexes Created
- All foreign keys indexed
- Slug fields indexed (fast lookups)
- Status fields indexed
- Featured/active flags indexed
- created_at indexed (sorting)

### Optimized Queries
```typescript
// Good - uses indexes
supabase.from('products').select('*').eq('slug', 'product-slug')

// Good - filtered on indexed column
supabase.from('products').select('*').eq('is_featured', true)

// Good - limited results
supabase.from('orders').select('*').limit(20)
```

## 🔄 Seed Data Included

### Categories (5)
- T-Shirts
- Hoodies
- Accessories
- Caps
- Jackets

### Teams (6)
- Red Bull Racing
- Scuderia Ferrari
- Mercedes-AMG Petronas
- McLaren F1 Team
- Aston Martin Aramco
- BWT Alpine F1 Team

### Products (8)
- Sample products for each category
- Multiple teams represented
- Featured products marked
- Realistic prices in NPR

### Events (3)
- Monaco Grand Prix Watch Party
- British Grand Prix Meetup
- Italian Grand Prix Special

### Settings (1)
- Site name: GearsNP
- Hero text configured
- Promo text set
- Support contact info
- Social media links

## 📝 Sample Queries

### Get Featured Products with Team Info
```typescript
const { data } = await supabase
  .from('products')
  .select('*, team:teams(*), category:categories(*)')
  .eq('is_featured', true)
  .eq('is_active', true);
```

### Get Order with Items
```typescript
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*), deliveries(*)')
  .eq('order_number', 'GNP-20241202-1234')
  .single();
```

### Create Order (Guest Checkout)
```typescript
const { data } = await supabase
  .from('orders')
  .insert({
    customer_name: 'John Doe',
    customer_phone: '+977-9800000000',
    customer_email: 'john@example.com',
    shipping_address: '123 Main St',
    city: 'Kathmandu',
    subtotal: 2999,
    shipping_fee: 150,
    total: 3149,
  })
  .select()
  .single();
```

### Get Upcoming Events
```typescript
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .gte('event_date', new Date().toISOString())
  .order('event_date', { ascending: true });
```

## 🛠️ Maintenance

### Make User Admin
```sql
SELECT make_user_admin('user@example.com');
```

### Reset Seed Data
```sql
-- Truncate all tables (careful!)
TRUNCATE categories, teams, products, product_images, 
         events, orders, order_items, deliveries 
RESTART IDENTITY CASCADE;

-- Re-run 04_seed_data.sql
```

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### View All Policies
```sql
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📚 Documentation

- **SETUP_GUIDE.md** - Complete setup walkthrough
- **01_schema.sql** - Table definitions
- **02_rls_policies.sql** - Security policies
- **03_storage.sql** - Storage configuration
- **04_seed_data.sql** - Sample data
- **../lib/supabase/types.ts** - TypeScript types

## ✅ Testing Your Setup

Run these queries to verify everything works:

```sql
-- Test 1: Count tables (should be 10)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test 2: Verify RLS enabled (all should be true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test 3: Check seed data
SELECT 'Products' as type, COUNT(*) FROM products
UNION ALL
SELECT 'Teams', COUNT(*) FROM teams
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Events', COUNT(*) FROM events;

-- Test 4: Check storage buckets (should be 3)
SELECT COUNT(*) FROM storage.buckets;
```

## 🎉 Ready to Go!

Your database is fully configured and ready for development. 

Next steps:
1. ✅ Database configured
2. → Build admin UI
3. → Connect storefront
4. → Implement checkout
5. → Add payment gateway
6. → Deploy to production

**Need help?** Check `SETUP_GUIDE.md` for detailed instructions.
