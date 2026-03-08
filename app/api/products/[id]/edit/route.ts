import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { optimizeImage, IMAGE_PRESETS } from "@/lib/image-optimizer";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const heroImageFile = formData.get("hero_image") as File | null;

    // Get current product data
    const { data: currentProduct } = await supabase
      .from("products")
      .select("hero_image_url")
      .eq("id", id)
      .single();

    let hero_image_url = currentProduct?.hero_image_url || null;

    // Upload new hero image if provided
    if (heroImageFile) {
      // Delete old image if it exists
      if (currentProduct?.hero_image_url) {
        const urlParts = currentProduct.hero_image_url.split("/");
        const oldFileName = urlParts[urlParts.length - 1];
        await supabase.storage
          .from("product-images")
          .remove([oldFileName]);
      }

      // Optimize and upload new image
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

    // Update product
    const { data, error } = await supabase
      .from("products")
      .update({
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
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
