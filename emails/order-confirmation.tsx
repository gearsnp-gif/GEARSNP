import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import { formatNepaliCurrency } from "@/lib/utils";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  image_url: string | null;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
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

export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  customerPhone,
  city,
  address,
  landmark,
  orderNote,
  items,
  subtotal,
  deliveryCharge,
  discount = 0,
  promoCode,
  total,
  createdAt,
}: OrderConfirmationEmailProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>Order Confirmation #{orderNumber} - GearsNP</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>GearsNP</Heading>
            <Text style={headerSubtitle}>Your Motorsport Gear Destination</Text>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <Heading style={successTitle}>✓ Order Confirmed!</Heading>
            <Text style={successText}>
              Thank you for your order, {customerName}! We&apos;ve received your order and will process it shortly.
            </Text>
          </Section>

          {/* Order Details */}
          <Section style={orderInfoSection}>
            <Text style={orderInfoLabel}>Order Number</Text>
            <Text style={orderInfoValue}>#{orderNumber}</Text>
            <Text style={orderInfoLabel}>Order Date</Text>
            <Text style={orderInfoValue}>{formattedDate}</Text>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section>
            <Heading style={sectionTitle}>Order Items</Heading>
            {items.map((item, index) => (
              <div key={index} style={itemContainer}>
                <Row>
                  <Column style={itemDetails}>
                    <Text style={itemName}>{item.name}</Text>
                    {item.size && <Text style={itemVariant}>Variant: {item.size}</Text>}
                    <Text style={itemQuantity}>Quantity: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text style={itemPriceText}>{formatNepaliCurrency(item.price * item.quantity)}</Text>
                  </Column>
                </Row>
              </div>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Order Summary */}
          <Section>
            <Heading style={sectionTitle}>Order Summary</Heading>
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Subtotal</Text>
              </Column>
              <Column>
                <Text style={summaryValue}>{formatNepaliCurrency(subtotal)}</Text>
              </Column>
            </Row>
            {discount > 0 && (
              <Row style={summaryRow}>
                <Column>
                  <Text style={{ ...summaryLabel, color: '#16a34a' }}>
                    Discount {promoCode && `(${promoCode})`}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ ...summaryValue, color: '#16a34a' }}>-{formatNepaliCurrency(discount)}</Text>
                </Column>
              </Row>
            )}
            <Row style={summaryRow}>
              <Column>
                <Text style={summaryLabel}>Delivery Charge</Text>
              </Column>
              <Column>
                <Text style={summaryValue}>{formatNepaliCurrency(deliveryCharge)}</Text>
              </Column>
            </Row>
            <Hr style={summaryDivider} />
            <Row style={summaryRow}>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column>
                <Text style={totalValue}>{formatNepaliCurrency(total)}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Delivery Address */}
          <Section>
            <Heading style={sectionTitle}>Delivery Address</Heading>
            <Text style={addressText}>
              <strong>{customerName}</strong>
              <br />
              {address}
              {landmark && (
                <>
                  <br />
                  Landmark: {landmark}
                </>
              )}
              <br />
              {city}
              <br />
              Phone: {customerPhone}
            </Text>
          </Section>

          {orderNote && (
            <>
              <Hr style={divider} />
              <Section>
                <Heading style={sectionTitle}>Order Note</Heading>
                <Text style={noteText}>{orderNote}</Text>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions about your order, please contact us at support@gearsnp.com
            </Text>
            <Text style={footerCopyright}>© {new Date().getFullYear()} GearsNP. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#e10600",
  padding: "32px 24px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const headerSubtitle = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "0",
};

const successSection = {
  padding: "32px 24px 24px",
  textAlign: "center" as const,
};

const successTitle = {
  color: "#15803d",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const successText = {
  color: "#666666",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const orderInfoSection = {
  padding: "0 24px",
  textAlign: "center" as const,
};

const orderInfoLabel = {
  color: "#666666",
  fontSize: "12px",
  fontWeight: "500",
  textTransform: "uppercase" as const,
  margin: "16px 0 4px",
};

const orderInfoValue = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "24px 24px",
};

const sectionTitle = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
  padding: "0 24px",
};

const itemContainer = {
  padding: "12px 24px",
  borderBottom: "1px solid #f3f4f6",
};

const itemDetails = {
  verticalAlign: "top" as const,
};

const itemName = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const itemVariant = {
  color: "#666666",
  fontSize: "12px",
  margin: "0 0 4px",
};

const itemQuantity = {
  color: "#666666",
  fontSize: "12px",
  margin: "0",
};

const itemPrice = {
  textAlign: "right" as const,
  verticalAlign: "top" as const,
};

const itemPriceText = {
  color: "#e10600",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
};

const summaryRow = {
  padding: "8px 24px",
};

const summaryLabel = {
  color: "#666666",
  fontSize: "14px",
  margin: "0",
};

const summaryValue = {
  color: "#1a1a1a",
  fontSize: "14px",
  textAlign: "right" as const,
  margin: "0",
};

const summaryDivider = {
  borderColor: "#e5e7eb",
  margin: "8px 24px",
};

const totalLabel = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const totalValue = {
  color: "#e10600",
  fontSize: "18px",
  fontWeight: "bold",
  textAlign: "right" as const,
  margin: "0",
};

const addressText = {
  color: "#1a1a1a",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "0 24px",
  margin: "0",
};

const noteText = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "0 24px",
  margin: "0",
  fontStyle: "italic" as const,
};

const footer = {
  padding: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
};

const footerCopyright = {
  color: "#999999",
  fontSize: "11px",
  margin: "0",
};
