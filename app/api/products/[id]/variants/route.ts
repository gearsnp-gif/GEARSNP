import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/products/[id]/variants - Fetch all variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await supabaseServer();
    const { id } = await params;

    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .eq("is_active", true)
      .order("size");

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

// POST /api/products/[id]/variants - Create/update variants for a product
export async function POST(
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

    // Parse request body
    const body = await request.text();
    const { variants } = JSON.parse(body);

    // Delete existing variants
    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", id);

    // Insert new variants
    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map((v: any) => ({
        product_id: id,
        size: v.size,
        stock: v.stock || 0,
        price_modifier: v.price_modifier || 0,
        is_active: v.is_active !== false,
      }));

      const { error } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
