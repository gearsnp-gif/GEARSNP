# Product Sizing & Multiple Images Implementation

## What's Been Done:

1. ✅ Created migration file: `supabase/03_add_product_sizes.sql`
   - Adds `product_variants` table for sizes (S, M, L, XL, etc.)
   - Each variant has its own stock level
   - Already has `product_images` table from initial schema

2. ✅ Created API routes for categories and teams listing:
   - GET `/api/categories` - Lists all categories
   - GET `/api/teams` - Lists all teams

## What You Need to Do:

### 1. Run the SQL Migration
Go to Supabase Dashboard → SQL Editor → Run this file:
```
supabase/03_add_product_sizes.sql
```

### 2. Simplified Approach (Recommended)
Keep the current Add Product form simple. After creating a product, add these features:

**Option A: Edit Product Dialog** (Add these to edit form)
- Checkbox: "Has Sizes" - When checked, show size selector
- If "Has Sizes" is checked, hide main stock field
- Show size grid: XS, S, M, L, XL, XXL, XXXL with stock input for each
- Multiple image uploader below hero image

**Option B: Separate Modals** (Click buttons from products table)
- "Manage Sizes" button → Opens dialog to add/edit sizes with stock
- "Manage Images" button → Opens dialog to upload multiple product images

### 3. Database Structure:

**Products Table** (already exists):
- Has `hero_image_url` for main image
- Has `stock` field (use this if product has NO sizes)

**Product Variants Table** (new):
- `product_id` - FK to products
- `size` - Text (S, M, L, XL, etc.)
- `stock` - Integer (stock for this size)
- `price_modifier` - Decimal (usually 0, but can add extra price for XXL, XXXL)

**Product Images Table** (already exists):
- `product_id` - FK to products
- `image_url` - Text
- `sort_order` - Integer

### 4. Business Logic:

**When product has sizes:**
- Ignore the main `products.stock` field
- Calculate total stock from sum of all variants
- Show size selector on frontend

**When product has NO sizes:**
- Use the main `products.stock` field
- Don't show variants

### 5. Quick Win - Add Multiple Images First:

Since sizing is complex, start with multiple images:

1. Add image uploader to Add Product Dialog that allows multiple files
2. After creating product, upload additional images to `product_images` table
3. Update the API route to handle multiple images

Would you like me to:
A) Create the "Manage Sizes" and "Manage Images" dialogs (simpler)
B) Update the Add Product form to include everything (more complex)
C) Just add multiple image support first (quickest win)
