"use server";

const DELIVERY_API_BASE_URL = process.env.DELIVERY_API_BASE_URL || "https://testing.gaaubesi.com.np/api/v1";
const DELIVERY_API_TOKEN = process.env.DELIVERY_API_TOKEN;

interface LocationData {
  id: number;
  name: string;
  delivery_charge: number;
}

export interface DeliveryRate {
  city: string;
  rate: number;
}

export async function getDeliveryRates(): Promise<DeliveryRate[]> {
  try {
    console.log("Fetching delivery rates...");
    
    if (!DELIVERY_API_TOKEN) {
      console.error("DELIVERY_API_TOKEN is not set in environment variables");
      return [];
    }

    const response = await fetch(
      `${DELIVERY_API_BASE_URL}/locations_data/`,
      {
        headers: {
          Authorization: `Token ${DELIVERY_API_TOKEN}`,
        },
        next: { revalidate: 21600 }, // Cache for 6 hours
      }
    );

    console.log("Response status:", response.status);

    if (!response.ok) {
      console.error("Failed to fetch delivery rates:", response.statusText);
      return [];
    }

    const data = await response.json();
    console.log("API Response:", JSON.stringify(data).substring(0, 500));

    // Handle both array and object with results property
    const locations: LocationData[] = Array.isArray(data) ? data : (data.results || data.data || []);

    if (!Array.isArray(locations)) {
      console.error("Unexpected API response format:", typeof data, Object.keys(data));
      return [];
    }

    console.log(`Found ${locations.length} locations`);

    const rates = locations.map((location) => ({
      city: location.name,
      rate: location.delivery_charge,
    }));

    console.log("Processed rates:", rates.slice(0, 3));

    return rates;
  } catch (error) {
    console.error("Error fetching delivery rates:", error);
    return [];
  }
}

interface GaaubesiOrderPayload {
  branch: string;
  destination_branch: string;
  receiver_name: string;
  receiver_address: string;
  receiver_number: string;
  cod_charge: number;
  Package_access: string;
  delivery_type: string;
  remarks: string;
  package_type: string;
  order_contact_name: string;
  order_contact_number: string;
}

interface GaaubesiOrderResponse {
  success: boolean;
  order_id?: string;
  message: string;
}

export async function createGaaubesiOrder(data: GaaubesiOrderPayload): Promise<GaaubesiOrderResponse> {
  try {
    if (!DELIVERY_API_TOKEN) {
      return {
        success: false,
        message: "Delivery API token is not configured",
      };
    }

    const response = await fetch(`${DELIVERY_API_BASE_URL}/order/create/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${DELIVERY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Failed to create delivery order: ${response.statusText}`,
      };
    }

    return {
      success: true,
      order_id: result.order_id || result.id,
      message: result.message || "Delivery order created successfully",
    };
  } catch (error) {
    console.error("Error creating Gaaubesi order:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create delivery order",
    };
  }
}
