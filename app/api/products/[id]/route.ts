import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

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
      const fileExt = hero_image.name.split(".").pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, hero_image, {
          cacheControl: "3600",
          upsert: true,
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

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
