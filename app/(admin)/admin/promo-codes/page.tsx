"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number | null;
  used_count: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface PromoFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  usage_limit: string;
  min_order_amount: string;
  max_discount_amount: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const defaultFormData: PromoFormData = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  usage_limit: "",
  min_order_amount: "",
  max_discount_amount: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/promo-codes");
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in { promoCodes: ... }
        setPromoCodes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
      toast.error("Failed to fetch promo codes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value.toString(),
        usage_limit: promo.usage_limit?.toString() || "",
        min_order_amount: promo.min_order_amount?.toString() || "",
        max_discount_amount: promo.max_discount_amount?.toString() || "",
        starts_at: promo.starts_at ? promo.starts_at.split("T")[0] : "",
        expires_at: promo.expires_at ? promo.expires_at.split("T")[0] : "",
        is_active: promo.is_active,
      });
    } else {
      setEditingPromo(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
        is_active: formData.is_active,
      };

      const url = editingPromo
        ? `/api/promo-codes/${editingPromo.id}`
        : "/api/promo-codes";
      
      const response = await fetch(url, {
        method: editingPromo ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save promo code");
      }

      toast.success(editingPromo ? "Promo code updated" : "Promo code created");
      setIsDialogOpen(false);
      fetchPromoCodes();
    } catch (error: unknown) {
      console.error("Failed to save promo code:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save promo code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const response = await fetch(`/api/promo-codes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete promo code");
      }

      toast.success("Promo code deleted");
      fetchPromoCodes();
    } catch (error) {
      console.error("Failed to delete promo code:", error);
      toast.error("Failed to delete promo code");
    }
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatus = (promo: PromoCode) => {
    if (!promo.is_active) return { label: "Inactive", variant: "secondary" as const };
    
    const now = new Date();
    if (promo.starts_at && new Date(promo.starts_at) > now) {
      return { label: "Scheduled", variant: "outline" as const };
    }
    if (promo.expires_at && new Date(promo.expires_at) < now) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return { label: "Limit Reached", variant: "destructive" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Promo Codes</h1>
          <p className="text-muted-foreground">Manage discount codes for your store</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
              </DialogTitle>
              <DialogDescription>
                {editingPromo
                  ? "Update the promo code details"
                  : "Create a new discount code for customers"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="SUMMER20"
                    required
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData((prev) => ({ ...prev, discount_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (NPR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {formData.discount_type === "percentage" ? "Percentage" : "Amount"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    max={formData.discount_type === "percentage" ? "100" : undefined}
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discount_value: e.target.value,
                      }))
                    }
                    placeholder={formData.discount_type === "percentage" ? "20" : "500"}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        usage_limit: e.target.value,
                      }))
                    }
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_order_amount">Min Order (optional)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        min_order_amount: e.target.value,
                      }))
                    }
                    placeholder="1000"
                  />
                </div>
              </div>

              {formData.discount_type === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="max_discount_amount">Max Discount Amount (optional)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_discount_amount: e.target.value,
                      }))
                    }
                    placeholder="500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starts_at">Start Date (optional)</Label>
                  <Input
                    id="starts_at"
                    type="date"
                    value={formData.starts_at}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        starts_at: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date (optional)</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expires_at: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingPromo ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>View and manage all discount codes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : promoCodes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No promo codes found. Create your first promo code to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {promoCodes.map((promo) => {
                const status = getStatus(promo);
                return (
                  <div
                    key={promo.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-secondary rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => copyToClipboard(promo.code)}
                          className="font-mono font-bold text-lg hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {promo.code}
                          {copiedCode === promo.code ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {promo.discount_type === "percentage"
                          ? `${promo.discount_value}% off`
                          : `NPR ${promo.discount_value} off`}
                        {promo.min_order_amount &&
                          ` on orders above NPR ${promo.min_order_amount}`}
                        {promo.max_discount_amount &&
                          ` (max NPR ${promo.max_discount_amount})`}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          Usage: {promo.used_count}
                          {promo.usage_limit ? `/${promo.usage_limit}` : ""}
                        </span>
                        <span>Starts: {formatDate(promo.starts_at)}</span>
                        <span>Expires: {formatDate(promo.expires_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(promo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
