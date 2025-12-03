"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const number = searchParams.get("order");
    setOrderNumber(number);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received it and will process it soon.
            </p>
          </div>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-1">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-bold text-[#e10600]">{orderNumber}</p>
            </div>
          )}

          {/* Info Card */}
          <div className="border border-border rounded-lg p-4 text-left space-y-2">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-[#e10600] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">What's next?</p>
                <p className="text-sm text-muted-foreground">
                  We'll contact you shortly to confirm your order details and arrange delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-muted-foreground">
            <p>Questions about your order?</p>
            <p>Please save your order number for reference.</p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Link href="/" className="block">
              <Button className="w-full bg-[#e10600] hover:bg-[#c00500]" size="lg">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
            <Link href="/shop" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
