import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { optimizeImage, IMAGE_PRESETS } from "@/lib/image-optimizer";

// PATCH /api/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await supabaseServer();
    const { id } = await params;
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or staff
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check Content-Type to determine how to parse the request
    const contentType = request.headers.get("content-type") || "";
    
    // Handle JSON requests (for simple updates like has_sizes flag)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      
      const updateData: Record<string, unknown> = {
        ...body,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(data);
    }

    // Handle FormData requests (for full product updates with images)
    const formData = await request.formData();

    // Extract form data
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const sku = formData.get("sku") as string;
    const category_id = formData.get("category_id") as string;
    const team_id = formData.get("team_id") as string | null;
    const short_description = formData.get("short_description") as string | null;
    const description = formData.get("description") as string | null;
    const base_price = parseFloat(formData.get("base_price") as string);
    const compare_at_price = formData.get("compare_at_price")
      ? parseFloat(formData.get("compare_at_price") as string)
      : null;
    const stock = parseInt(formData.get("stock") as string);
    const is_featured = formData.get("is_featured") === "true";
    const is_active = formData.get("is_active") === "true";
    const hero_image = formData.get("hero_image") as File | null;
    const additional_images_count = parseInt(formData.get("additional_images_count") as string || "0");
    const images_to_delete = JSON.parse(formData.get("images_to_delete") as string || "[]");

    // Prepare update data
    const updateData: Record<string, unknown> = {
      name,
      slug,
      sku,
      category_id,
      team_id,
      short_description,
      description,
      base_price,
      compare_at_price,
      stock,
      is_featured,
      is_active,
      updated_at: new Date().toISOString(),
    };

    // Handle hero image upload if provided
    if (hero_image && hero_image.size > 0) {
      // Optimize image before upload
      const { buffer, fileName, contentType } = await optimizeImage(
        hero_image,
        IMAGE_PRESETS.hero
      );
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, buffer, {
          cacheControl: "31536000",
          upsert: true,
          contentType,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      updateData.hero_image_url = publicUrl;
    }

    // Update product
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Delete images marked for deletion
    if (images_to_delete.length > 0) {
      // Get image URLs to delete from storage
      const { data: imagesToDelete } = await supabase
        .from("product_images")
        .select("image_url")
        .in("id", images_to_delete);

      if (imagesToDelete && imagesToDelete.length > 0) {
        // Delete from storage
        const filesToDelete = imagesToDelete.map((img) => {
          const urlParts = img.image_url.split("/");
          return urlParts[urlParts.length - 1];
        });
        
        await supabase.storage
          .from("product-images")
          .remove(filesToDelete);
      }

      // Delete from database
      await supabase
        .from("product_images")
        .delete()
        .in("id", images_to_delete);
    }

    // Upload additional images
    if (additional_images_count > 0) {
      // Get current max sort_order
      const { data: existingImages } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", id)
        .order("sort_order", { ascending: false })
        .limit(1);

      let nextSortOrder = existingImages && existingImages.length > 0 
        ? (existingImages[0].sort_order || 0) + 1 
        : 1;

      const additionalImageUploads = [];

      for (let i = 0; i < additional_images_count; i++) {
        const imageFile = formData.get(`additional_image_${i}`) as File;
        
        if (imageFile && imageFile.size > 0) {
          // Optimize image before upload
          const { buffer, fileName, contentType } = await optimizeImage(
            imageFile,
            IMAGE_PRESETS.gallery
          );
          const filePath = `gallery/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, buffer, {
              cacheControl: "31536000",
              upsert: false,
              contentType,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("product-images")
              .getPublicUrl(filePath);

            additionalImageUploads.push({
              product_id: id,
              image_url: publicUrl,
              sort_order: nextSortOrder++,
            });
          }
        }
      }

      // Insert new images into database
      if (additionalImageUploads.length > 0) {
        await supabase
          .from("product_images")
          .insert(additionalImageUploads);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
