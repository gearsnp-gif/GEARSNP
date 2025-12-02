# GearsNP Admin CRUD Implementation Status

## ✅ COMPLETED

### 1. Utility Functions
- ✅ `lib/utils.ts` - slugify(), formatNepaliCurrency(), parseNepaliCurrency()
- ✅ `lib/supabase/storage.ts` - uploadFile(), deleteFile()

### 2. Category CRUD (100% Complete)
- ✅ `components/admin/categories/AddCategoryButton.tsx`
- ✅ `components/admin/categories/EditCategoryDialog.tsx`
- ✅ `components/admin/categories/DeleteCategoryButton.tsx`
- ✅ `app/api/categories/create/route.ts`
- ✅ `app/api/categories/[id]/edit/route.ts`
- ✅ `app/api/categories/[id]/delete/route.ts`
- ✅ `app/(admin)/admin/categories/page.tsx` - Updated with CRUD components

### 3. Team CRUD (Partial)
- ✅ `components/admin/teams/AddTeamDialog.tsx` - With logo upload
- ✅ `app/api/teams/create/route.ts` - With file upload to team-logos bucket
- ⏳ Need: EditTeamDialog, DeleteTeamButton, Edit/Delete API routes
- ⏳ Need: Update teams page.tsx

## ⏳ REMAINING WORK

### 4. Team CRUD - Remaining Files
Create these files following the category pattern:

```tsx
// components/admin/teams/EditTeamDialog.tsx
- Similar to AddTeamDialog but pre-populate fields
- Handle logo update (delete old, upload new)
- Call POST /api/teams/[id]/edit

// components/admin/teams/DeleteTeamButton.tsx  
- Similar to DeleteCategoryButton
- Also delete logo from storage
- Call DELETE /api/teams/[id]/delete

// app/api/teams/[id]/edit/route.ts
- Similar to categories edit route
- Handle FormData with logo file
- Update logo in storage if new file provided

// app/api/teams/[id]/delete/route.ts
- Similar to categories delete route
- Also delete logo file from storage using deleteFile()

// app/(admin)/admin/teams/page.tsx
- Fetch teams from Supabase
- Display in cards with logo preview
- Show colors as badges
- Include Edit and Delete buttons
```

### 5. Product CRUD
This is the most complex module. Key features:

**Components needed:**
- `AddProductDialog.tsx` - Multi-step or long form
- `EditProductDialog.tsx` - Similar to add
- `DeleteProductButton.tsx` - Standard delete
- `ProductImageUploader.tsx` - Handle multiple images

**API Routes:**
- `/api/products/create` - Already exists, may need updates
- `/api/products/[id]/edit` - New
- `/api/products/[id]/delete` - New  
- `/api/products/[id]/images` - Upload multiple images

**Key Implementation Details:**
- Use select dropdowns for category_id and team_id
- Format prices with formatNepaliCurrency()
- Display prices as "Nrs. {amount}"
- Hero image upload to product-images bucket
- Additional images array (product_images table)
- Stock quantity number input
- SKU auto-generation or manual entry

### 6. Event CRUD

**Components:**
- `AddEventDialog.tsx` - With date picker and banner upload
- `EditEventDialog.tsx` - Update event
- `DeleteEventButton.tsx` - Delete event

**API Routes:**
- `/api/events/create` - Update existing
- `/api/events/[id]/edit` - New
- `/api/events/[id]/delete` - New

**Features:**
- Date picker for event_date
- Banner upload to event-banners bucket
- Location text input
- Title, slug, description

### 7. Settings Update

**Component:**
- Update `app/(admin)/admin/settings/page.tsx`
- Create form with all settings fields
- Single UPDATE to settings table where id = 1

**API Route:**
- `/api/settings/update` - POST route

**Fields:**
- site_name
- support_email
- support_phone
- promo_text
- instagram_url
- tiktok_url
- primary_color
- secondary_color

## 🎯 QUICK WIN APPROACH

Since you have the pattern from Categories working, you can:

1. **Copy & Modify**: Take AddCategoryButton.tsx and adapt it for each module
2. **API Pattern**: All API routes follow the same auth check pattern
3. **Form Schema**: Use zod schemas similar to categorySchema
4. **File Uploads**: Use the pattern from AddTeamDialog.tsx

### Common Code Patterns

**Auth Check (all API routes):**
```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();

if (!profile || !["admin", "staff"].includes(profile.role)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

**File Upload Pattern:**
```ts
const fileExt = file.name.split(".").pop();
const fileName = `${Date.now()}.${fileExt}`;
const filePath = `bucket-name/${fileName}`;

const { error: uploadError } = await supabase.storage
  .from("bucket-name")
  .upload(filePath, file);

const { data: { publicUrl } } = supabase.storage
  .from("bucket-name")
  .getPublicUrl(filePath);
```

**Dialog Form Pattern:**
```tsx
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

const onSubmit = async (data) => {
  setLoading(true);
  try {
    const response = await fetch("/api/...", {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error();
    
    toast.success("Success!");
    setOpen(false);
    router.refresh();
  } catch (error) {
    toast.error("Failed!");
  } finally {
    setLoading(false);
  }
};
```

## 📦 Dependencies Installed
- ✅ react-hook-form
- ✅ @hookform/resolvers  
- ✅ zod
- ✅ sonner (toast notifications)
- ✅ shadcn/ui components: form, dialog, alert-dialog, textarea, switch, sonner

## 🚀 Next Steps

1. Complete Team CRUD (4 files)
2. Complete Product CRUD (4 components + 3 API routes)
3. Complete Event CRUD (3 components + 3 API routes)
4. Complete Settings (1 page update + 1 API route)
5. Add Toaster to root layout for toast notifications

## 💡 Tips

- All admin pages should be server components
- All forms/dialogs should be client components  
- Use router.refresh() after mutations
- Always show loading states
- Use toast for user feedback
- Validate file sizes (2MB for logos, 5MB for products/banners)
- Always check authentication in API routes
- Use FormData for file uploads
- Store files with unique names (timestamp + extension)
