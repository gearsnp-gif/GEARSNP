"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatNepaliCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { DeliveryRate } from "@/lib/delivery-rates";
import { CitySelector } from "@/components/store/CitySelector";
import { getImageBySize } from "@/lib/image-utils";

function RacingLightsOverlay() {
  const [activeLight, setActiveLight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev < 5 ? prev + 1 : 0));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4">
      {[0, 1, 2, 3, 4].map((light) => (
        <div
          key={light}
          className={`w-16 h-16 rounded-full border-4 border-gray-700 transition-all duration-200 ${
            light < activeLight
              ? "bg-[#e10600] shadow-[0_0_30px_rgba(225,6,0,0.9)]"
              : "bg-gray-800"
          }`}
        />
      ))}
    </div>
  );
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  image_url: string | null;
  free_delivery?: boolean;
}

interface CheckoutFormProps {
  deliveryRates: readonly DeliveryRate[];
}

export default function CheckoutForm({ deliveryRates }: CheckoutFormProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [promoCode, setPromoCode] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  
  // Promo code state
  const [promoValidating, setPromoValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    discount_amount: number;
  } | null>(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    setIsLoading(false);

    // Redirect if cart is empty
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Check if all items have free delivery
  const allFreeDelivery = cartItems.length > 0 && cartItems.every(item => item.free_delivery === true);
  const effectiveDeliveryCharge = allFreeDelivery ? 0 : deliveryCharge;
  
  // Calculate discount amount based on current subtotal
  const discountAmount = appliedPromo ? appliedPromo.discount_amount : 0;
  const total = subtotal - discountAmount + effectiveDeliveryCharge;

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    const rate = deliveryRates.find((r) => r.city === selectedCity);
    setDeliveryCharge(rate?.rate || 0);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setPromoValidating(true);
    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), order_amount: subtotal }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedPromo({
          id: data.promo_id,
          code: promoCode.trim().toUpperCase(),
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          discount_amount: data.discount_amount,
        });
        toast.success(`Promo code applied! You save ${formatNepaliCurrency(data.discount_amount)}`);
      } else {
        toast.error(data.message || "Invalid promo code");
        setAppliedPromo(null);
      }
    } catch (error) {
      console.error("Failed to validate promo code:", error);
      toast.error("Failed to validate promo code");
    } finally {
      setPromoValidating(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName || !phone || !city || !address) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in our system
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: fullName,
          customer_email: email || null,
          customer_phone: phone,
          city,
          address,
          landmark: landmark || null,
          order_note: orderNote || null,
          payment_method: paymentMethod,
          items: cartItems,
          subtotal,
          delivery_charge: effectiveDeliveryCharge,
          total,
          promo_code: appliedPromo?.code || null,
          promo_discount: appliedPromo?.discount_amount || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      // Redirect to success page with order number
      router.push(`/order-success?order=${data.order.order_number}`);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Racing Lights Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6">
          <RacingLightsOverlay />
          <p className="text-white text-xl font-bold tracking-wider">PLACING ORDER...</p>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* General Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e10600] text-white font-bold">
                      1
                    </div>
                    <h2 className="text-xl font-bold">General Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">
                        Full Name <span className="text-[#e10600]">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="eg: Max Bahadur"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="eg: max@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-[#e10600]">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="eg: 9862200000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="orderNote">Order Note (any message for us)</Label>
                      <Input
                        id="orderNote"
                        placeholder="eg: i love max"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e10600] text-white font-bold">
                      2
                    </div>
                    <h2 className="text-xl font-bold">Delivery Address</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">
                        City/District <span className="text-[#e10600]">*</span>
                      </Label>
                      <CitySelector
                        deliveryRates={deliveryRates}
                        value={city}
                        onValueChange={handleCityChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">
                        Address <span className="text-[#e10600]">*</span>
                      </Label>
                      <Input
                        id="address"
                        placeholder="eg: kathmandu, tinkune"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input
                        id="landmark"
                        placeholder="eg: madan bhandari park"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e10600] text-white font-bold">
                      3
                    </div>
                    <h2 className="text-xl font-bold">Payment Methods</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-3 border-2 border-[#e10600] rounded-lg p-4 bg-[#e10600]/5">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#e10600]/10">
                          <ShoppingBag className="h-5 w-5 text-[#e10600]" />
                        </div>
                        <div>
                          <p className="font-semibold">Cash on delivery</p>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold">Order Summary</h2>

                  {/* Cart Items */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                          {item.image_url ? (
                            <Image src={getImageBySize(item.image_url, 'thumbnail')} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 bg-[#e10600] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.name}</p>
                          {item.size && <p className="text-xs text-muted-foreground">Variant: {item.size}</p>}
                          <p className="text-sm font-bold text-[#e10600]">
                            {formatNepaliCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sub-total</span>
                      <span>{formatNepaliCurrency(subtotal)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Discount ({appliedPromo.code})</span>
                        <span className="text-green-600">-{formatNepaliCurrency(appliedPromo.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Charge</span>
                      {allFreeDelivery ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : city ? (
                        <span className={effectiveDeliveryCharge === 0 ? "text-green-600" : ""}>
                          {formatNepaliCurrency(effectiveDeliveryCharge)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Select city</span>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-[#e10600]">{formatNepaliCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <Label htmlFor="promoCode">Promo Code</Label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between mt-1 p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                        <div>
                          <span className="font-mono font-bold text-green-700 dark:text-green-400">{appliedPromo.code}</span>
                          <span className="text-sm text-green-600 dark:text-green-500 ml-2">
                            {appliedPromo.discount_type === "percentage" 
                              ? `${appliedPromo.discount_value}% off` 
                              : `${formatNepaliCurrency(appliedPromo.discount_value)} off`}
                          </span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRemovePromo}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="promoCode"
                          placeholder="eg: FREE30"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        />
                        <Button 
                          type="button" 
                          onClick={handleApplyPromo} 
                          className="bg-[#e10600] hover:bg-[#c00500]"
                          disabled={promoValidating}
                        >
                          {promoValidating ? "..." : "APPLY"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#e10600] hover:bg-[#c00500]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : `Place Order - ${formatNepaliCurrency(total)}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
