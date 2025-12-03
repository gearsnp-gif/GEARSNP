"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatNepaliCurrency } from "@/lib/utils";
import { Eye, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createGaaubesiOrder } from "@/app/actions/delivery";

interface OrderItem {
  id: string;
  product_name: string;
  size: string | null;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  city: string;
  shipping_address: string;
  status: string;
  payment_status: string;
  total: number;
  cod_amount: number | null;
  created_at: string;
  gaaubesi_order_id: string | null;
  admin_note: string | null;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; orderId: string; orderNumber: string }>({ 
    open: false, 
    orderId: "", 
    orderNumber: "" 
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
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

  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.filter(o => !o.gaaubesi_order_id).length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.filter(o => !o.gaaubesi_order_id).map(o => o.id)));
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${deleteDialog.orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Order deleted successfully");
        fetchOrders();
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setDeleteDialog({ open: false, orderId: "", orderNumber: "" });
    }
  };

  const handleBulkSendToDelivery = async () => {
    if (selectedOrders.size === 0) {
      toast.error("Please select orders to send");
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const orderId of Array.from(selectedOrders)) {
        const order = orders.find(o => o.id === orderId);
        if (!order) continue;

        const packageType = order.order_items
          .map((item) => `${item.product_name}${item.size ? ` - ${item.size}` : ""} x ${item.quantity}`)
          .join(", ");

        const result = await createGaaubesiOrder({
          branch: "HEAD OFFICE",
          destination_branch: order.city,
          receiver_name: order.customer_name,
          receiver_address: order.shipping_address,
          receiver_number: order.customer_phone,
          cod_charge: order.cod_amount || order.total,
          Package_access: "Can't Open",
          delivery_type: "Drop Off",
          remarks: order.admin_note || "",
          package_type: packageType,
          order_contact_name: "GearsNp",
          order_contact_number: "9823832475",
        });

        if (result.success) {
          await fetch(`/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gaaubesi_order_id: result.order_id,
              sent_to_delivery_at: new Date().toISOString(),
              status: "shipping",
            }),
          });
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to send order ${order.order_number}:`, result.message);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} order(s) sent to delivery`);
        setSelectedOrders(new Set());
        fetchOrders();
      }
      if (failCount > 0) {
        toast.error(`${failCount} order(s) failed to send`);
      }
    } catch (error) {
      console.error("Error sending orders:", error);
      toast.error("Failed to send orders to delivery");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {orders?.filter((o) => o.status === "pending").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Pending Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {orders?.filter((o) => o.status === "confirmed" || o.status === "processing").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {orders?.filter((o) => o.status === "delivered").length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {formatNepaliCurrency(
                orders?.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0) || 0
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </div>
            {selectedOrders.size > 0 && (
              <Button
                onClick={handleBulkSendToDelivery}
                disabled={isSending}
                className="bg-[#e10600] hover:bg-[#c00500]"
              >
                <Package className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : `Send ${selectedOrders.size} to Delivery`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.size > 0 && selectedOrders.size === orders.filter(o => !o.gaaubesi_order_id).length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>COD Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No orders yet
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        disabled={!!order.gaaubesi_order_id}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        {order.order_items?.map((item, idx) => (
                          <div key={item.id} className="truncate">
                            {item.product_name}{item.size ? ` - ${item.size}` : ""} x {item.quantity}
                            {idx < order.order_items.length - 1 && ", "}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNepaliCurrency(parseFloat((order.cod_amount || order.total).toString()))}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, orderId: order.id, orderNumber: order.order_number })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order #{deleteDialog.orderNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
