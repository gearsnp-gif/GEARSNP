"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNepaliCurrency } from "@/lib/utils";
import { ArrowLeft, Package, Save, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProductSelector } from "@/components/admin/ProductSelector";
import { createGaaubesiOrder } from "@/app/actions/delivery";

interface Product {
  id: string;
  name: string;
  base_price: number;
  hero_image_url: string | null;
}

interface OrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    hero_image_url: string | null;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  city: string;
  notes: string | null;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  gaaubesi_order_id?: string | null;
  sent_to_delivery_at?: string | null;
  order_items: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingToDelivery, setIsSendingToDelivery] = useState(false);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [orderId, setOrderId] = useState<string>("");
  
  // Editable fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [prepaidAmount, setPrepaidAmount] = useState(0);
  const [codAmount, setCodAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    params.then((p) => {
      setOrderId(p.id);
      fetchOrder(p.id);
    });
    fetchProducts();
  }, [params]);

  const fetchOrder = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (response.ok && data.order) {
        setOrder(data.order);
        setStatus(data.order.status);
        setPaymentStatus(data.order.payment_status);
        setAdminNote(data.order.admin_note || "");
        setCustomerName(data.order.customer_name);
        setCustomerEmail(data.order.customer_email || "");
        setCustomerPhone(data.order.customer_phone);
        setShippingAddress(data.order.shipping_address);
        setCity(data.order.city);
        setOrderItems(data.order.order_items || []);
        setPrepaidAmount(data.order.prepaid_amount || 0);
        setCodAmount(data.order.cod_amount || data.order.total);
        setDiscountAmount(data.order.discount_amount || 0);
      } else {
        toast.error("Failed to load order");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToDelivery = async () => {
    if (!order) return;

    setIsSendingToDelivery(true);
    try {
      const packageType = orderItems
        .map((item) => `${item.product_name}${item.size ? ` - ${item.size}` : ""} x ${item.quantity}`)
        .join(", ");

      const result = await createGaaubesiOrder({
        branch: "HEAD OFFICE",
        destination_branch: "BARDAGHAT",
        receiver_name: customerName,
        receiver_address: shippingAddress,
        receiver_number: customerPhone,
        cod_charge: codAmount || calculateTotal(),
        Package_access: "Can't Open",
        delivery_type: "Pickup",
        remarks: adminNote || "",
        package_type: packageType,
        order_contact_name: "GearsNp",
        order_contact_number : "9823832475"
      });

      if (result.success) {
        toast.success(`Delivery order created: ${result.order_id || "Success"}`);
        // Update order with gaaubesi_order_id, timestamp, and change status to shipping
        await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gaaubesi_order_id: result.order_id,
            sent_to_delivery_at: new Date().toISOString(),
            status: "shipping",
          }),
        });
        // Update local status state
        setStatus("shipping");
        // Refresh order data
        fetchOrder(orderId);
      } else {
        toast.error(result.message || "Failed to create delivery order");
      }
    } catch (error) {
      console.error("Error sending to delivery:", error);
      toast.error("Failed to send order to delivery");
    } finally {
      setIsSendingToDelivery(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          payment_status: paymentStatus,
          admin_note: adminNote,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress,
          city: city,
          order_items: orderItems,
          prepaid_amount: prepaidAmount,
          cod_amount: codAmount,
          discount_amount: discountAmount,
        }),
      });

      if (response.ok) {
        toast.success("Order updated successfully");
        fetchOrder(orderId);
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity } : item
      )
    );
  };

  const updateItemSize = (itemId: string, newSize: string) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, size: newSize } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    if (orderItems.length === 1) {
      toast.error("Cannot remove the last item");
      return;
    }
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (order?.shipping_fee || 0) - discountAmount;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (response.ok && data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const changeItemProduct = (itemId: string, newProductId: string) => {
    const selectedProduct = products.find(p => p.id === newProductId);
    if (!selectedProduct) return;

    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              product_id: selectedProduct.id,
              product_name: selectedProduct.name,
              unit_price: selectedProduct.base_price,
              total_price: selectedProduct.base_price * item.quantity,
              product: {
                hero_image_url: selectedProduct.hero_image_url,
              },
            }
          : item
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Order #{order.order_number}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {order.gaaubesi_order_id && (
                <div className="mt-2 text-sm">
                  <span className="text-green-600 font-medium">✓ Sent to Delivery</span>
                  {order.sent_to_delivery_at && (
                    <span className="text-muted-foreground ml-2">
                      on {new Date(order.sent_to_delivery_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                  <div className="text-muted-foreground">
                    Delivery Order ID: {order.gaaubesi_order_id}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-end gap-3">
              <div className="w-[160px]">
                <Label htmlFor="status" className="text-xs mb-1 block">Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[160px]">
                <Label htmlFor="payment" className="text-xs mb-1 block">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="payment" className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSendToDelivery}
                disabled={isSendingToDelivery || !!order.gaaubesi_order_id}
                variant="outline"
                className="h-9 whitespace-nowrap"
              >
                <Package className="h-4 w-4 mr-2" />
                {isSendingToDelivery ? "Sending..." : order.gaaubesi_order_id ? "Already Sent" : "Send to Delivery"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-9 bg-[#e10600] hover:bg-[#c00500] whitespace-nowrap"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                    {item.product?.hero_image_url ? (
                      <Image
                        src={item.product.hero_image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <Label className="text-xs">Product:</Label>
                      <ProductSelector
                        products={products}
                        value={products.find(p => p.name === item.product_name)?.id || ""}
                        onValueChange={(value) => changeItemProduct(item.id, value)}
                        currentProductName={item.product_name}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Label className="text-xs">Size:</Label>
                      <Select value={item.size || ""} onValueChange={(value) => updateItemSize(item.id, value)}>
                        <SelectTrigger className="h-7 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatNepaliCurrency(item.unit_price)} each
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                        disabled={orderItems.length === 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold">{formatNepaliCurrency(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email address (optional)"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Textarea
                  id="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Full shipping address"
                  rows={3}
                />
              </div>
              {order.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Customer Note</p>
                  <p className="text-sm bg-muted p-3 rounded">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Management */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatNepaliCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatNepaliCurrency(order.shipping_fee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatNepaliCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatNepaliCurrency(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="discountAmount">Discount Amount</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setDiscountAmount(value);
                  }}
                  placeholder="0.00"
                />
                {discountAmount > 0 && (
                  <p className="text-xs text-green-600 mt-1">Saving {formatNepaliCurrency(discountAmount)}</p>
                )}
              </div>
              <div className="border-t pt-4">
                <Label htmlFor="prepaidAmount">Prepaid Amount</Label>
                <Input
                  id="prepaidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={prepaidAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setPrepaidAmount(value);
                    setCodAmount(calculateTotal() - value);
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="codAmount">COD Amount</Label>
                <Input
                  id="codAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={codAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setCodAmount(value);
                    setPrepaidAmount(calculateTotal() - value);
                  }}
                  placeholder="0.00"
                />
              </div>
              <div className="pt-3 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total:</span>
                  <span className="font-medium">{formatNepaliCurrency(calculateTotal())}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-green-600">-{formatNepaliCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prepaid:</span>
                  <span className="font-medium text-green-600">{formatNepaliCurrency(prepaidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD:</span>
                  <span className="font-medium text-orange-600">{formatNepaliCurrency(codAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Note */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="adminNote"
                placeholder="Add internal notes about this order..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
