import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductInfo } from "@/components/store/ProductInfo";
import { Price } from "@/components/store/Price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await supabaseServer();
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return {
    title: product?.name || "Product",
    description: product?.description || "View product details",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await supabaseServer();
  const { slug } = await params;

  // Fetch product with all related data
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      team:teams(*),
      category:categories(*),
      product_images(image_url, sort_order),
      product_variants(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  // Build image array: hero_image first, then additional product_images sorted by sort_order
  const images: string[] = [];
  
  // Add hero image first if it exists
  if (product.hero_image_url) {
    images.push(product.hero_image_url);
  }
  
  // Add additional images from product_images table
  if (product.product_images.length > 0) {
    const sortedProductImages = product.product_images
      .sort((a: { sort_order: number | null }, b: { sort_order: number | null }) =>
        (a.sort_order || 0) - (b.sort_order || 0)
      )
      .map((img: { image_url: string }) => img.image_url);
    
    // Only add product_images that are different from hero_image_url
    sortedProductImages.forEach((url: string) => {
      if (url !== product.hero_image_url) {
        images.push(url);
      }
    });
  }

  // Get sizes if available
  const sizes = product.has_sizes ? product.product_variants : [];

  // Fetch related products from same team
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(`
      *,
      team:teams(*),
      product_images(image_url, sort_order)
    `)
    .eq("team_id", product.team_id)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/shop">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <ProductGallery images={images} />

          {/* Product Info */}
          <ProductInfo
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              base_price: product.base_price,
              compare_at_price: product.compare_at_price,
              stock: product.stock,
              is_featured: product.is_featured,
              has_sizes: product.has_sizes,
              free_delivery: product.free_delivery || false,
              hero_image_url: product.hero_image_url,
              team: product.team,
              category: product.category,
            }}
            sizes={sizes.map((s: any) => ({
              id: s.id,
              size: s.size,
              stock: s.stock,
              price_modifier: s.price_modifier || 0,
            }))}
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="flex flex-col items-center text-center p-4">
              <Package className="h-8 w-8 mb-2 text-[#e10600]" />
              <p className="text-sm font-medium">Premium Quality</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center text-center p-4">
              <Truck className="h-8 w-8 mb-2 text-[#e10600]" />
              <p className="text-sm font-medium">Fast Delivery</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center text-center p-4">
              <ShieldCheck className="h-8 w-8 mb-2 text-[#e10600]" />
              <p className="text-sm font-medium">Secure Payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">More from {product.team?.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => {
                // Show hero_image_url if available, otherwise first product_image
                const displayImage = relProduct.hero_image_url || 
                  relProduct.product_images.sort(
                    (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
                      (a.sort_order || 0) - (b.sort_order || 0)
                  )[0]?.image_url;
                
                return (
                  <Link
                    key={relProduct.id}
                    href={`/products/${relProduct.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square">
                        {displayImage ? (
                          <Image
                            src={displayImage}
                            alt={relProduct.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            quality={75}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate group-hover:text-[#e10600] transition-colors">
                          {relProduct.name}
                        </h3>
                        <Price amount={relProduct.base_price} />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
