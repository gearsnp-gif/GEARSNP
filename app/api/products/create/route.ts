import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { optimizeImage, IMAGE_PRESETS } from "@/lib/image-optimizer";

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    
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

    const formData = await request.formData();
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
    const free_delivery = formData.get("free_delivery") === "true";
    const heroImageFile = formData.get("hero_image") as File | null;
    const additionalImagesCount = parseInt(formData.get("additional_images_count") as string) || 0;

    let hero_image_url = null;

    // Upload hero image if provided
    if (heroImageFile) {
      // Optimize image before upload
      const { buffer, fileName, contentType } = await optimizeImage(
        heroImageFile,
        IMAGE_PRESETS.hero
      );
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, buffer, {
          cacheControl: "31536000",
          upsert: false,
          contentType,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      hero_image_url = publicUrl;
    }

    // Insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
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
        hero_image_url,
        is_featured,
        is_active,
        free_delivery,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Upload additional images if provided
    if (additionalImagesCount > 0 && product) {
      const additionalImageUploads = [];
      
      for (let i = 0; i < additionalImagesCount; i++) {
        const imageFile = formData.get(`additional_image_${i}`) as File | null;
        if (imageFile) {
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
              product_id: product.id,
              image_url: publicUrl,
              sort_order: i + 1, // Start from 1 since hero image is 0
            });
          }
        }
      }

      // Insert additional images into product_images table
      if (additionalImageUploads.length > 0) {
        await supabase
          .from("product_images")
          .insert(additionalImageUploads);
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
