"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category_id: z.string().uuid("Select a category"),
  team_id: z.string().uuid("Select a team").optional().nullable(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  base_price: z.coerce.number().min(0, "Price must be 0 or greater"),
  compare_at_price: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or greater"),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  free_delivery: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
}

interface EditProductDialogProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    category_id: string;
    team_id: string | null;
    short_description: string | null;
    description: string | null;
    base_price: number;
    compare_at_price: number | null;
    stock: number;
    is_featured: boolean;
    is_active: boolean;
    free_delivery: boolean;
    hero_image_url: string | null;
  };
}

export function EditProductDialog({ product }: EditProductDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>(product.hero_image_url || "");
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{id: string; image_url: string; sort_order: number}[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    // @ts-expect-error - z.coerce creates unknown type but works correctly at runtime
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category_id: product.category_id,
      team_id: product.team_id,
      short_description: product.short_description || "",
      description: product.description || "",
      base_price: product.base_price,
      compare_at_price: product.compare_at_price,
      stock: product.stock,
      is_featured: product.is_featured,
      is_active: product.is_active,
      free_delivery: product.free_delivery,
    },
  });

  useEffect(() => {
    if (open) {
      // Fetch categories, teams, and existing product images
      Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/teams").then((r) => r.json()),
        fetch(`/api/products/${product.id}/images`).then((r) => r.json()).catch(() => ({ images: [] })),
      ])
        .then(([catsData, teamsData, imagesData]) => {
          setCategories(Array.isArray(catsData) ? catsData : []);
          setTeams(Array.isArray(teamsData) ? teamsData : []);
          setExistingImages(imagesData.images || []);
        })
        .catch(() => {
          setCategories([]);
          setTeams([]);
          setExistingImages([]);
        });
    }
  }, [open, product.id]);

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAdditionalImages((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("sku", data.sku);
      formData.append("category_id", data.category_id);
      if (data.team_id) formData.append("team_id", data.team_id);
      if (data.short_description) formData.append("short_description", data.short_description);
      if (data.description) formData.append("description", data.description);
      formData.append("base_price", String(data.base_price));
      if (data.compare_at_price) formData.append("compare_at_price", String(data.compare_at_price));
      formData.append("stock", String(data.stock));
      formData.append("is_featured", String(data.is_featured));
      formData.append("is_active", String(data.is_active));
      formData.append("free_delivery", String(data.free_delivery));
      
      // Only append hero image if a new one was selected
      if (heroImage) {
        formData.append("hero_image", heroImage);
      }

      // Append additional images
      additionalImages.forEach((img, index) => {
        formData.append(`additional_image_${index}`, img);
      });
      formData.append("additional_images_count", String(additionalImages.length));

      // Append images to delete
      formData.append("images_to_delete", JSON.stringify(imagesToDelete));

      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }

      toast.success("Product updated successfully");
      setOpen(false);
      setAdditionalImages([]);
      setAdditionalPreviews([]);
      setImagesToDelete([]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* @ts-expect-error - z.coerce type inference issue */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Red Bull Racing T-Shirt"
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue("slug", slugify(e.target.value));
                        }}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SKU-12345" disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="red-bull-racing-t-shirt" disabled={loading} />
                  </FormControl>
                  <FormDescription>URL-friendly version of name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief product description" disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Detailed product description..." disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (NPR)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="2999"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compare_at_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare Price (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="3999"
                        value={field.value || ""}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="100"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Hero Image</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageChange}
                    disabled={loading}
                  />
                  {heroPreview && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroPreview}
                        alt="Hero preview"
                        className="h-32 w-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Upload new image to replace current one</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Additional Product Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                    disabled={loading}
                  />
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.image_url}
                              alt="Product image"
                              className="h-24 w-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img.id)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={loading}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Preview */}
                  {additionalPreviews.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">New Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {additionalPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              disabled={loading}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>Upload multiple product images (optional)</FormDescription>
            </FormItem>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>Show on homepage</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Show on storefront</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="free_delivery"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-green-700 dark:text-green-400">Free Delivery</FormLabel>
                    <FormDescription>No delivery charge for this product</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
