import CheckoutForm from "@/components/store/CheckoutForm";
import { DELIVERY_RATES } from "@/lib/delivery-rates";

export default function CheckoutPage() {
  return <CheckoutForm deliveryRates={DELIVERY_RATES} />;
}
