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
}

interface ShippingConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  gaaubesiOrderId: string;
  city: string;
  address: string;
  landmark: string | null;
  items: OrderItem[];
  total: number;
  shippedAt: string;
}

export default function ShippingConfirmationEmail({
  orderNumber,
  customerName,
  gaaubesiOrderId,
  city,
  address,
  landmark,
  items,
  total,
  shippedAt,
}: ShippingConfirmationEmailProps) {
  const formattedDate = new Date(shippedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} is on its way! - GearsNP</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>GearsNP</Heading>
            <Text style={headerSubtitle}>Your Motorsport Gear Destination</Text>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <Text style={shippingIcon}>📦</Text>
            <Heading style={successTitle}>Your Order is on its way!</Heading>
            <Text style={successText}>
              Great news {customerName}! Your order has been shipped and is on its way to you.
            </Text>
          </Section>

          {/* Tracking Info */}
          <Section style={trackingSection}>
            <Text style={trackingLabel}>Tracking Information</Text>
            <Text style={trackingId}>{gaaubesiOrderId}</Text>
            <Text style={trackingNote}>
              Your order is being delivered by Gaaubesi. You can track your delivery status using the tracking ID above.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order Details */}
          <Section style={orderInfoSection}>
            <Row>
              <Column>
                <Text style={orderInfoLabel}>Order Number</Text>
                <Text style={orderInfoValue}>#{orderNumber}</Text>
              </Column>
              <Column>
                <Text style={orderInfoLabel}>Shipped On</Text>
                <Text style={orderInfoValue}>{formattedDate}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Order Items */}
          <Section>
            <Heading style={sectionTitle}>Items in this shipment</Heading>
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
            
            <div style={totalContainer}>
              <Row>
                <Column>
                  <Text style={totalLabel}>Total Amount</Text>
                </Column>
                <Column>
                  <Text style={totalValue}>{formatNepaliCurrency(total)}</Text>
                </Column>
              </Row>
            </div>
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
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Important Info */}
          <Section style={infoBox}>
            <Text style={infoTitle}>📋 Important Information</Text>
            <Text style={infoText}>
              • Please keep your phone accessible for delivery updates
              <br />
              • Ensure someone is available to receive the package
              <br />
              • Please keep the exact cash amount ready for COD orders
              <br />
              • Contact us immediately if you need to change delivery details
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions about your delivery, please contact us at support@gearsnp.com
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

const shippingIcon = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const successTitle = {
  color: "#1a1a1a",
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

const trackingSection = {
  padding: "24px",
  backgroundColor: "#f9fafb",
  margin: "24px 24px",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const trackingLabel = {
  color: "#666666",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 8px",
};

const trackingId = {
  color: "#e10600",
  fontSize: "24px",
  fontWeight: "bold",
  fontFamily: "monospace",
  margin: "0 0 12px",
  letterSpacing: "1px",
};

const trackingNote = {
  color: "#666666",
  fontSize: "13px",
  lineHeight: "18px",
  margin: "0",
};

const orderInfoSection = {
  padding: "0 24px",
};

const orderInfoLabel = {
  color: "#666666",
  fontSize: "12px",
  fontWeight: "500",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const orderInfoValue = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
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

const totalContainer = {
  padding: "16px 24px",
  backgroundColor: "#f9fafb",
  marginTop: "8px",
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

const infoBox = {
  padding: "20px 24px",
  backgroundColor: "#eff6ff",
  margin: "0 24px",
  borderRadius: "8px",
  borderLeft: "4px solid #3b82f6",
};

const infoTitle = {
  color: "#1e40af",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 12px",
};

const infoText = {
  color: "#1e40af",
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0",
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
