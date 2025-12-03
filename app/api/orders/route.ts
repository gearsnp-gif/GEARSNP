import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/email';

// GET /api/orders - Fetch orders (admin sees all, users see their own)
export async function GET() {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('orders')
      .select('*, order_items(*), deliveries(*)');

    // Non-admin users can only see their own orders
    if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order (guest checkout supported)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      city,
      address,
      landmark,
      order_note,
      items,
      subtotal,
      delivery_charge,
      total,
      gaaubesi_order_id,
      sent_to_delivery_at,
      status,
    } = body;

    // Validation
    if (!customer_name || !customer_phone || !city || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build shipping address string
    const shipping_address = landmark 
      ? `${address}, ${landmark}, ${city}` 
      : `${address}, ${city}`;

    const supabase = await supabaseServer();

    // Generate order number - simple sequential number starting from 1001
    const { data: lastOrder } = await supabase
      .from("orders")
      .select("order_number")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let orderNumber = "1001";
    if (lastOrder && lastOrder.order_number) {
      const lastNumber = parseInt(lastOrder.order_number);
      orderNumber = (lastNumber + 1).toString();
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_email,
        customer_phone,
        city,
        shipping_address,
        notes: order_note,
        payment_status: 'unpaid',
        status: status || 'pending',
        subtotal,
        shipping_fee: delivery_charge || 0,
        discount_amount: 0,
        total,
        gaaubesi_order_id: gaaubesi_order_id || null,
        sent_to_delivery_at: sent_to_delivery_at || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      size: item.size || null,
      unit_price: item.price,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Rollback: delete the order
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Send order confirmation email if customer email is provided
    if (customer_email) {
      try {
        await sendOrderConfirmationEmail({
          orderNumber: order.order_number,
          customerName: customer_name,
          customerEmail: customer_email,
          customerPhone: customer_phone,
          city,
          address,
          landmark,
          orderNote: order_note,
          items: items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || null,
            image_url: item.image_url || null,
          })),
          subtotal,
          deliveryCharge: delivery_charge || 0,
          total,
          createdAt: order.created_at,
        });
        console.log(`Order confirmation email sent to ${customer_email}`);
      } catch (emailError) {
        // Log error but don't fail the order creation
        console.error("Failed to send order confirmation email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
