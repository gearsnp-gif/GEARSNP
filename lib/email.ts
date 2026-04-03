import { Resend } from "resend";
import OrderConfirmationEmail from "@/emails/order-confirmation";
import ShippingConfirmationEmail from "@/emails/shipping-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  image_url: string | null;
}

interface SendOrderConfirmationEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  landmark: string | null;
  orderNote: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount?: number;
  promoCode?: string | null;
  total: number;
  createdAt: string;
}

export async function sendOrderConfirmationEmail(params: SendOrderConfirmationEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "GearsNP <onboarding@resend.dev>",
      to: params.customerEmail,
      subject: `Order Confirmation #${params.orderNumber} - GearsNP`,
      react: OrderConfirmationEmail(params),
    });

    if (error) {
      console.error("Error sending order confirmation email:", error);
      return { success: false, error: error.message };
    }

    console.log("Order confirmation email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

interface ShippingItem {
  name: string;
  price: number;
  quantity: number;
  size: string | null;
}

interface SendShippingConfirmationEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  gaaubesiOrderId: string;
  city: string;
  address: string;
  landmark: string | null;
  items: ShippingItem[];
  total: number;
  shippedAt: string;
}

export async function sendShippingConfirmationEmail(params: SendShippingConfirmationEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "GearsNP <onboarding@resend.dev>",
      to: params.customerEmail,
      subject: `Your Order #${params.orderNumber} is on its way! - GearsNP`,
      react: ShippingConfirmationEmail(params),
    });

    if (error) {
      console.error("Error sending shipping confirmation email:", error);
      return { success: false, error: error.message };
    }

    console.log("Shipping confirmation email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send shipping confirmation email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
