# Admin Order Editing Feature

## Overview
The admin order detail page now supports full editing capabilities for orders. Admins can modify customer information, adjust order items (quantities and sizes), and track payment breakdowns.

## Features Implemented

### 1. Customer Information Editing
- **Customer Name**: Edit the customer's full name
- **Phone Number**: Update contact phone
- **Email Address**: Modify email (optional field)
- **City**: Change delivery city
- **Shipping Address**: Edit full shipping address with textarea

All customer fields are now editable input fields instead of static text.

### 2. Order Items Management
- **Product Selection**: Change the product for any order item
  - Dropdown lists all available products
  - When changed, updates product name, unit price, and image
  - Automatically recalculates item total based on new price
- **Quantity Control**: Use +/- buttons to adjust item quantities
  - Minimum quantity is 1
  - Each change recalculates the item's total price
- **Size Selection**: Dropdown to change item size (S, M, L, XL, XXL)
- **Remove Items**: Delete button for each item
  - Cannot remove the last item in an order
  - Shows trash icon for easy identification
- **Dynamic Pricing**: Item totals and order subtotal update automatically

### 3. Payment Tracking
- **Prepaid Amount**: Input field for amounts paid in advance
- **COD Amount**: Input field for cash-on-delivery amount
- **Auto-calculation**: When one amount changes, the other adjusts automatically
  - COD Amount = Total - Prepaid Amount
  - Prepaid Amount = Total - COD Amount
- **Visual Summary**: Shows both amounts with color coding
  - Prepaid: Green text
  - COD: Orange text

### 4. Order Summary & Discounts
- **Discount Amount**: Editable input field to apply discounts
  - Enter any discount amount
  - Updates order total instantly
  - Shows discount value in green when applied
- **Dynamic Totals**: Recalculates automatically when items or discount changes
  - Subtotal updates based on edited quantities and products
  - Total = Subtotal + Shipping Fee - Discount Amount
- **Real-time Updates**: All calculations happen instantly

## Database Changes Required

Run these SQL scripts in your Supabase SQL Editor:

### Script 1: Admin Notes (07_add_admin_note.sql)
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
```

### Script 2: Payment Tracking (08_add_payment_tracking.sql)
```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS prepaid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cod_amount DECIMAL(10,2) DEFAULT 0;

UPDATE orders 
SET cod_amount = total 
WHERE cod_amount = 0 OR cod_amount IS NULL;
```

## API Updates

### PATCH /api/orders/[id]
The endpoint now accepts these additional fields:

**Customer Information:**
- `customer_name`
- `customer_email`
- `customer_phone`
- `shipping_address`
- `city`

**Order Items:**
- `order_items[]` - Array of order items with updated products, quantities, sizes, prices, and totals

**Pricing:**
- `discount_amount` - Discount applied to the order

**Payment Tracking:**
- `prepaid_amount`
- `cod_amount`

**Automatic Calculations:**
- When order items change, the API recalculates:
  - `subtotal` - Sum of all item totals
  - `total` - Subtotal + shipping fee - discount amount

## Usage

1. Navigate to **Admin → Orders** page
2. Click the **eye icon** on any order to view details
3. Edit any field directly in the form
4. Adjust order items:
   - Select different product from dropdown
   - Click **+** or **-** to change quantities
   - Select new size from dropdown
   - Click **trash icon** to remove items
5. Apply discount:
   - Enter discount amount in Order Summary section
   - Total updates automatically
6. Update payment tracking:
   - Enter prepaid amount
   - COD amount updates automatically
6. Add admin notes in the textarea
7. Click **Save Changes** button
8. Success toast confirms the update

## Technical Details

### State Management
All editable fields are managed with React `useState`:
- Customer info: `customerName`, `customerEmail`, `customerPhone`, `shippingAddress`, `city`
- Order items: `orderItems` array with product, quantity, size, and prices
- Pricing: `discountAmount`
- Payment: `prepaidAmount`, `codAmount`
- Products: `products` array loaded from API

### Helper Functions
- `fetchProducts()` - Loads all available products for product selector
- `changeItemProduct(itemId, newProductId)` - Changes product for an order item, updates name, price, and image
- `updateItemQuantity(itemId, newQuantity)` - Adjusts item quantity and recalculates total
- `updateItemSize(itemId, newSize)` - Changes item size
- `removeItem(itemId)` - Removes item from order (min 1 item)
- `calculateSubtotal()` - Sums all item totals
- `calculateTotal()` - Adds shipping, subtracts discount amount

### Validation
- Minimum 1 item per order (cannot remove last item)
- Minimum 1 quantity per item
- All required customer fields must be filled
- Payment amounts can't exceed order total

## Files Modified

1. **app/(admin)/admin/orders/[id]/page.tsx**
   - Added editable state for all fields
   - Replaced static displays with Input/Textarea components
   - Added quantity controls with +/- buttons
   - Added size dropdown selectors
   - Added remove item functionality
   - Added payment tracking inputs
   - Implemented dynamic calculation functions

2. **app/api/orders/[id]/route.ts**
   - Extended PATCH endpoint to accept all new fields
   - Added order items update logic
   - Added automatic subtotal/total recalculation
   - Properly typed all parameters

3. **supabase/07_add_admin_note.sql** (NEW)
   - Migration for admin_note column

4. **supabase/08_add_payment_tracking.sql** (NEW)
   - Migration for prepaid_amount and cod_amount columns

## Next Steps (Optional Enhancements)

1. **Add New Items**: Allow admin to add new products to existing orders
2. **Order History**: Track all changes made to orders with timestamps
3. **Bulk Updates**: Select and update multiple orders at once
4. **Print Invoice**: Generate PDF invoice for orders
5. **Order Cancellation**: Cancel orders and restore stock
6. **Refund Tracking**: Track refunds for returned items
7. **Shipping Label**: Generate shipping labels
8. **Email Notifications**: Notify customers when order details change

## Testing Checklist

- [x] Customer info fields are editable
- [x] Order items can be changed to different products
- [x] Order items quantity can be increased/decreased
- [x] Order items size can be changed
- [x] Items can be removed (except last item)
- [x] Discount amount can be edited
- [x] Subtotal recalculates when items change
- [x] Total recalculates correctly with discount
- [x] Prepaid amount updates COD automatically
- [x] COD amount updates prepaid automatically
- [x] Save button sends all changes to API
- [x] Success toast appears on save
- [x] Order list page shows updated data
- [ ] Database migrations executed successfully
- [ ] Prepaid/COD amounts persist in database
- [ ] Product changes save correctly to database
- [ ] Discount amount persists in database
