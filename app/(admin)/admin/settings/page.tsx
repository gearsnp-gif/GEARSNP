"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const settingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  promo_text: z.string().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  support_phone: z.string().optional(),
  support_email: z.string().email("Invalid email").optional().or(z.literal("")),
  instagram_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  tiktok_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [faviconImage, setFaviconImage] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      site_name: "",
      hero_title: "",
      hero_subtitle: "",
      promo_text: "",
      primary_color: "#dc2626",
      secondary_color: "#3b82f6",
      support_phone: "",
      support_email: "",
      instagram_url: "",
      tiktok_url: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          form.reset({
            site_name: data.site_name || "",
            hero_title: data.hero_title || "",
            hero_subtitle: data.hero_subtitle || "",
            promo_text: data.promo_text || "",
            primary_color: data.primary_color || "#dc2626",
            secondary_color: data.secondary_color || "#3b82f6",
            support_phone: data.support_phone || "",
            support_email: data.support_email || "",
            instagram_url: data.instagram_url || "",
            tiktok_url: data.tiktok_url || "",
          });
          // Set banner preview if exists
          if (data.banner_image_url) {
            setBannerPreview(data.banner_image_url);
          }
          // Set logo preview if exists
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
          }
          // Set favicon preview if exists
          if (data.favicon_url) {
            setFaviconPreview(data.favicon_url);
          }
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    setLoading(true);
    try {
      // If there's any image, use FormData
      if (bannerImage || logoImage || faviconImage) {
        const formData = new FormData();
        formData.append("site_name", data.site_name);
        if (data.hero_title) formData.append("hero_title", data.hero_title);
        if (data.hero_subtitle) formData.append("hero_subtitle", data.hero_subtitle);
        if (data.promo_text) formData.append("promo_text", data.promo_text);
        if (data.primary_color) formData.append("primary_color", data.primary_color);
        if (data.secondary_color) formData.append("secondary_color", data.secondary_color);
        if (data.support_phone) formData.append("support_phone", data.support_phone);
        if (data.support_email) formData.append("support_email", data.support_email);
        if (data.instagram_url) formData.append("instagram_url", data.instagram_url);
        if (data.tiktok_url) formData.append("tiktok_url", data.tiktok_url);
        if (bannerImage) formData.append("banner_image", bannerImage);
        if (logoImage) formData.append("logo_image", logoImage);
        if (faviconImage) formData.append("favicon_image", faviconImage);

        const response = await fetch("/api/settings", {
          method: "PATCH",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update settings");
        }
      } else {
        // Otherwise use JSON
        const response = await fetch("/api/settings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update settings");
        }
      }

      toast.success("Settings updated successfully");
      setBannerImage(null);
      setLogoImage(null);
      setFaviconImage(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your store settings</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading settings...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="site_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="GearsNP" disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Welcome to GearsNP" disabled={loading} />
                    </FormControl>
                    <FormDescription>Main heading on homepage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hero_subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subtitle</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Your ultimate destination for F1 merchandise"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>Subheading on homepage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="promo_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promo Text</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Free shipping on orders over NPR 5000"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>Promotional banner text</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Hero Banner Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageChange}
                  disabled={loading}
                />
                {bannerPreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="h-48 w-full object-cover rounded border"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Carousel/hero banner image for homepage (recommended: 1920x600px)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Site Logo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoImageChange}
                  disabled={loading}
                />
                {logoPreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-24 w-auto object-contain rounded border bg-white p-2"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Site logo for header/navbar (recommended: PNG with transparency)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Favicon</label>
                <Input
                  type="file"
                  accept="image/x-icon,image/png,image/svg+xml"
                  onChange={handleFaviconImageChange}
                  disabled={loading}
                />
                {faviconPreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="h-12 w-12 object-contain rounded border bg-white p-1"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Browser tab icon (recommended: 32x32px or 64x64px, .ico or .png)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} type="color" className="w-20 h-10" disabled={loading} />
                        </FormControl>
                        <Input {...field} placeholder="#dc2626" disabled={loading} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} type="color" className="w-20 h-10" disabled={loading} />
                        </FormControl>
                        <Input {...field} placeholder="#3b82f6" disabled={loading} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Customer support contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="support_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+977 1234567890" disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="support_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="support@gearsnp.com" disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://instagram.com/gearsnp"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://tiktok.com/@gearsnp"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
