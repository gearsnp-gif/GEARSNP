import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { sendShippingConfirmationEmail } from "@/lib/email";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/orders/[id] - Fetch single order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();

    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product:products (
            hero_image_url
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      status, 
      payment_status, 
      admin_note, 
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      order_items,
      prepaid_amount,
      cod_amount,
      discount_amount,
      gaaubesi_order_id,
      sent_to_delivery_at
    } = body;

    const supabase = await supabaseServer();

    // Check if status is being changed to shipping and we have gaaubesi_order_id
    const shouldSendShippingEmail = 
      status === "shipping" && 
      gaaubesi_order_id && 
      customer_email;
    
    console.log("Email check:", { 
      status, 
      gaaubesi_order_id, 
      customer_email, 
      shouldSendShippingEmail 
    });

    // Update order fields
    const updateData: Record<string, string | number | null> = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (admin_note !== undefined) updateData.admin_note = admin_note;
    if (customer_name) updateData.customer_name = customer_name;
    if (customer_email !== undefined) updateData.customer_email = customer_email;
    if (customer_phone) updateData.customer_phone = customer_phone;
    if (shipping_address) updateData.shipping_address = shipping_address;
    if (city) updateData.city = city;
    if (prepaid_amount !== undefined) updateData.prepaid_amount = prepaid_amount;
    if (cod_amount !== undefined) updateData.cod_amount = cod_amount;
    if (discount_amount !== undefined) updateData.discount_amount = discount_amount;
    if (gaaubesi_order_id !== undefined) updateData.gaaubesi_order_id = gaaubesi_order_id;
    if (sent_to_delivery_at !== undefined) updateData.sent_to_delivery_at = sent_to_delivery_at;

    // Calculate new totals if order_items changed or discount changed
    if (order_items && order_items.length > 0) {
      const subtotal = order_items.reduce((sum: number, item: { total_price: number }) => sum + item.total_price, 0);
      updateData.subtotal = subtotal;
      
      // Get current shipping fee to recalculate total
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("shipping_fee")
        .eq("id", id)
        .single();
      
      if (currentOrder) {
        const finalDiscount = discount_amount !== undefined ? discount_amount : 0;
        updateData.total = subtotal + currentOrder.shipping_fee - finalDiscount;
      }
    } else if (discount_amount !== undefined) {
      // If only discount changed, recalculate total
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("subtotal, shipping_fee")
        .eq("id", id)
        .single();
      
      if (currentOrder) {
        updateData.total = currentOrder.subtotal + currentOrder.shipping_fee - discount_amount;
      }
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update order items if provided
    if (order_items && order_items.length > 0) {
      for (const item of order_items) {
        const updateItemData: Record<string, string | number> = {
          product_name: item.product_name,
          quantity: item.quantity,
          size: item.size,
          unit_price: item.unit_price,
          total_price: item.total_price,
        };
        
        // Update product_id if it was changed
        if (item.product_id) {
          updateItemData.product_id = item.product_id;
        }

        const { error: itemError } = await supabase
          .from("order_items")
          .update(updateItemData)
          .eq("id", item.id);

        if (itemError) {
          console.error("Error updating order item:", itemError);
        }
      }
    }

    // Send shipping confirmation email if order is being shipped
    if (shouldSendShippingEmail) {
      try {
        // Fetch order items for email
        const { data: items } = await supabase
          .from("order_items")
          .select("product_name, size, quantity, unit_price")
          .eq("order_id", id);

        if (items && items.length > 0) {
          await sendShippingConfirmationEmail({
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email!,
            gaaubesiOrderId: gaaubesi_order_id,
            city: order.city,
            address: order.shipping_address,
            landmark: null, // Could extract from shipping_address if needed
            items: items.map((item) => ({
              name: item.product_name,
              price: item.unit_price,
              quantity: item.quantity,
              size: item.size,
            })),
            total: order.total,
            shippedAt: sent_to_delivery_at || new Date().toISOString(),
          });
          console.log(`Shipping confirmation email sent to ${order.customer_email}`);
        }
      } catch (emailError) {
        // Log error but don't fail the order update
        console.error("Failed to send shipping confirmation email:", emailError);
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await supabaseServer();

    // Delete order (order_items will be automatically deleted due to CASCADE)
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
