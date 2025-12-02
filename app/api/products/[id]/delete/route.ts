import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function DELETE(
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

    // Get product to find hero image URL
    const { data: product } = await supabase
      .from("products")
      .select("hero_image_url")
      .eq("id", id)
      .single();

    // Delete hero image from storage if it exists
    if (product?.hero_image_url) {
      const urlParts = product.hero_image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage
        .from("product-images")
        .remove([fileName]);
    }

    // Get and delete product images
    const { data: productImages } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    if (productImages && productImages.length > 0) {
      const filesToDelete = productImages.map((img) => {
        const urlParts = img.image_url.split("/");
        return urlParts[urlParts.length - 1];
      });
      
      await supabase.storage
        .from("product-images")
        .remove(filesToDelete);
    }

    // Delete product (cascade will delete product_images)
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
