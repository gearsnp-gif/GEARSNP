import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// POST /api/promo-codes/validate - Validate and calculate discount
export async function POST(request: NextRequest) {
  try {
    // Create admin client inside function to handle missing env vars gracefully
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { valid: false, message: "Server configuration error" },
        { status: 500 }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    const body = await request.json();
    const { code, order_amount } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Promo code is required" },
        { status: 400 }
      );
    }

    if (!order_amount || order_amount <= 0) {
      return NextResponse.json(
        { valid: false, message: "Valid order amount is required" },
        { status: 400 }
      );
    }

    // Find the promo code (without is_active filter to check status properly)
    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .ilike("code", code)
      .single();

    if (error || !promo) {
      return NextResponse.json({
        valid: false,
        message: "Invalid promo code",
      });
    }

    // Check if code is active
    if (!promo.is_active) {
      return NextResponse.json({
        valid: false,
        message: "This promo code is no longer active",
      });
    }

    // Check if code has started
    if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
      return NextResponse.json({
        valid: false,
        message: "This promo code is not yet active",
      });
    }

    // Check if code has expired
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({
        valid: false,
        message: "This promo code has expired",
      });
    }

    // Check usage limit
    if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit) {
      return NextResponse.json({
        valid: false,
        message: "This promo code has expired",
      });
    }

    // Check minimum order amount
    if (promo.min_order_amount && order_amount < promo.min_order_amount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount is Rs. ${promo.min_order_amount}`,
      });
    }

    // Calculate discount
    let discount_amount: number;
    if (promo.discount_type === "percentage") {
      discount_amount = order_amount * (promo.discount_value / 100);
      // Apply max discount cap if set
      if (promo.max_discount_amount && discount_amount > promo.max_discount_amount) {
        discount_amount = promo.max_discount_amount;
      }
    } else {
      discount_amount = promo.discount_value;
      // Don't discount more than order amount
      if (discount_amount > order_amount) {
        discount_amount = order_amount;
      }
    }

    return NextResponse.json({
      valid: true,
      promo_id: promo.id,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount: Math.round(discount_amount * 100) / 100,
      message: `Promo code applied! You save Rs. ${Math.round(discount_amount)}`,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
