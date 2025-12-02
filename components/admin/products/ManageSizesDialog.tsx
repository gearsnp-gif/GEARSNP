"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface SizeVariant {
  id?: string;
  size: string;
  stock: number;
  price_modifier: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  has_sizes: boolean;
}

interface ManageSizesDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManageSizesDialog({ product, open, onOpenChange, onSuccess }: ManageSizesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [hasSizes, setHasSizes] = useState(false);
  const [variants, setVariants] = useState<SizeVariant[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!product || !open) return;

      setHasSizes(product.has_sizes);
      
      try {
        const response = await fetch(`/api/products/${product.id}/variants`);
        if (response.ok) {
          const data = await response.json();
          setVariants(data);
        } else {
          setVariants([]);
        }
      } catch (error) {
        console.error("Failed to load variants:", error);
        setVariants([]);
      }
    };

    loadData();
  }, [product, open]);

  const handleSizeToggle = (size: string) => {
    const existingVariant = variants.find((v) => v.size === size);
    
    if (existingVariant) {
      // Remove variant
      setVariants(variants.filter((v) => v.size !== size));
    } else {
      // Add new variant
      setVariants([
        ...variants,
        {
          size,
          stock: 0,
          price_modifier: 0,
          is_active: true,
        },
      ]);
    }
  };

  const handleStockChange = (size: string, stock: number) => {
    setVariants(
      variants.map((v) =>
        v.size === size ? { ...v, stock: Math.max(0, stock) } : v
      )
    );
  };

  const handlePriceModifierChange = (size: string, modifier: number) => {
    setVariants(
      variants.map((v) =>
        v.size === size ? { ...v, price_modifier: modifier } : v
      )
    );
  };

  const handleSubmit = async () => {
    if (!product) return;

    setLoading(true);
    try {
      // Update product has_sizes flag
      const updateResponse = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ has_sizes: hasSizes }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update product");
      }

      // Save variants
      if (hasSizes) {
        const variantsResponse = await fetch(`/api/products/${product.id}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants }),
        });

        if (!variantsResponse.ok) {
          throw new Error("Failed to save variants");
        }
      }

      toast.success("Size variants updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update sizes");
    } finally {
      setLoading(false);
    }
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Sizes - {product?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Has Sizes Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-sizes"
              checked={hasSizes}
              onCheckedChange={(checked: boolean) => setHasSizes(checked)}
              disabled={loading}
            />
            <Label htmlFor="has-sizes" className="font-medium">
              This product has size variants (S, M, L, etc.)
            </Label>
          </div>

          {hasSizes && (
            <>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Size Variants</h3>
                  {variants.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      Total Stock: {totalStock}
                    </span>
                  )}
                </div>

                {/* Size Selection Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = variants.some((v) => v.size === size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        disabled={loading}
                        className={`p-3 border rounded text-center font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock & Price Inputs for Selected Sizes */}
                {variants.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Configure Selected Sizes</h4>
                    </div>
                    {variants
                      .sort((a, b) => AVAILABLE_SIZES.indexOf(a.size) - AVAILABLE_SIZES.indexOf(b.size))
                      .map((variant) => (
                        <div
                          key={variant.size}
                          className="grid grid-cols-[60px_1fr_1fr_auto_auto] gap-3 items-end"
                        >
                          <div className="font-semibold text-center bg-muted px-2 py-1 rounded h-9 flex items-center justify-center">
                            {variant.size}
                          </div>
                          <div>
                            <Label htmlFor={`stock-${variant.size}`} className="text-xs">
                              Stock
                            </Label>
                            <Input
                              id={`stock-${variant.size}`}
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                handleStockChange(variant.size, parseInt(e.target.value) || 0)
                              }
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`modifier-${variant.size}`} className="text-xs">
                              Price +/- (NPR)
                            </Label>
                            <Input
                              id={`modifier-${variant.size}`}
                              type="number"
                              step="0.01"
                              value={variant.price_modifier}
                              onChange={(e) =>
                                handlePriceModifierChange(
                                  variant.size,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={loading}
                              placeholder="0.00"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setVariants(
                                variants.map((v) =>
                                  v.size === variant.size
                                    ? v
                                    : {
                                        ...v,
                                        stock: variant.stock,
                                        price_modifier: variant.price_modifier,
                                      }
                                )
                              );
                              toast.success(`Copied to all other sizes`);
                            }}
                            disabled={loading}
                            title="Copy stock & price to all sizes"
                            className="h-9 w-9"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSizeToggle(variant.size)}
                            disabled={loading}
                            className="h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}

                {variants.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select sizes above to configure stock and pricing
                  </p>
                )}
              </div>

              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-medium mb-1">How this works:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Stock levels are managed per size</li>
                  <li>Price modifiers adjust the base product price (e.g., +50 for XL)</li>
                  <li>Customers will select a size before adding to cart</li>
                </ul>
              </div>
            </>
          )}

          {!hasSizes && (
            <div className="bg-muted p-4 rounded text-sm text-muted-foreground">
              Enable &quot;has size variants&quot; to manage different sizes with individual stock levels and pricing.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
