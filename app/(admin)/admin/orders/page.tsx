"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
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
          delivery_type: "Pickup",
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
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {orders?.filter((o) => o.status === "pending").length || 0}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {orders?.filter((o) => o.status === "confirmed" || o.status === "processing").length || 0}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-xl md:text-2xl font-bold">
              {orders?.filter((o) => o.status === "delivered").length || 0}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-lg md:text-2xl font-bold">
              {formatNepaliCurrency(
                orders?.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0) || 0
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">All Orders</CardTitle>
              <CardDescription className="text-xs md:text-sm">View and manage all customer orders</CardDescription>
            </div>
            {selectedOrders.size > 0 && (
              <Button
                onClick={handleBulkSendToDelivery}
                disabled={isSending}
                className="bg-[#e10600] hover:bg-[#c00500] w-full md:w-auto"
                size="sm"
              >
                <Package className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : `Send ${selectedOrders.size} to Delivery`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-[140px] ${getStatusColor(order.status)} text-white border-0 hover:opacity-90`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending" className="focus:bg-yellow-100">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                              Pending
                            </span>
                          </SelectItem>
                          <SelectItem value="confirmed" className="focus:bg-blue-100">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Confirmed
                            </span>
                          </SelectItem>
                          <SelectItem value="processing" className="focus:bg-purple-100">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              Processing
                            </span>
                          </SelectItem>
                          <SelectItem value="shipping" className="focus:bg-indigo-100">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                              Shipping
                            </span>
                          </SelectItem>
                          <SelectItem value="delivered" className="focus:bg-green-100">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              Delivered
                            </span>
                          </SelectItem>
                          <SelectItem value="cancelled" className="focus:bg-red-100">
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Cancelled
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {!orders || orders.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No orders yet
              </div>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(order.status).replace('bg-', '#') }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedOrders.has(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                          disabled={!!order.gaaubesi_order_id}
                        />
                        <div>
                          <div className="font-medium text-base">#{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_name}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
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
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="text-right">
                          {order.order_items?.map((item, idx) => (
                            <div key={item.id} className="text-xs">
                              {item.product_name}{item.size ? ` - ${item.size}` : ""} x {item.quantity}
                            </div>
                          ))}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-muted-foreground">COD:</span>
                        <span>{formatNepaliCurrency(parseFloat((order.cod_amount || order.total).toString()))}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className={`w-[120px] h-8 ${getStatusColor(order.status)} text-white border-0 text-xs`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="confirmed" className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Confirmed
                              </span>
                            </SelectItem>
                            <SelectItem value="processing" className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Processing
                              </span>
                            </SelectItem>
                            <SelectItem value="shipping" className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Shipping
                              </span>
                            </SelectItem>
                            <SelectItem value="delivered" className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Delivered
                              </span>
                            </SelectItem>
                            <SelectItem value="cancelled" className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Cancelled
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="text-xs">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
