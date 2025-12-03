"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNepaliCurrency } from "@/lib/utils";
import { Eye, Package } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  product_name: string;
  size: string | null;
  quantity: number;
}

interface Delivery {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  shipping_address: string;
  status: string;
  total: number;
  cod_amount: number | null;
  gaaubesi_order_id: string;
  sent_to_delivery_at: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.orders) {
        // Filter only orders that have been sent to delivery
        const sentDeliveries = data.orders.filter((order: Delivery) => order.gaaubesi_order_id);
        setDeliveries(sentDeliveries);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shipping":
        return "bg-indigo-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading deliveries...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Deliveries</h1>
        <p className="text-muted-foreground">Track order deliveries and shipments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {deliveries.filter((d) => d.status === "shipping").length}
            </div>
            <p className="text-sm text-muted-foreground">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {deliveries.filter((d) => d.status === "delivered").length}
            </div>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{deliveries.length}</div>
            <p className="text-sm text-muted-foreground">Total Shipments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
          <CardDescription>Monitor all shipments sent to delivery service</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery ID</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>COD Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 opacity-50" />
                      <p>No deliveries sent yet</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-mono text-sm">
                      {delivery.gaaubesi_order_id}
                    </TableCell>
                    <TableCell className="font-medium">{delivery.order_number}</TableCell>
                    <TableCell>{delivery.customer_name}</TableCell>
                    <TableCell>{delivery.customer_phone}</TableCell>
                    <TableCell>{delivery.city}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {delivery.order_items?.map((item, idx) => (
                          <div key={item.id} className="truncate">
                            {item.product_name}
                            {item.size ? ` - ${item.size}` : ""} x {item.quantity}
                            {idx < delivery.order_items.length - 1 && ", "}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNepaliCurrency(
                        parseFloat((delivery.cod_amount || delivery.total).toString())
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(delivery.sent_to_delivery_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${delivery.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
