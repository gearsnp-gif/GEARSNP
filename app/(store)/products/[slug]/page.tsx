import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/store/ProductGallery";
import { AddToCartButton } from "@/components/store/AddToCartButton";
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

  console.log('Product data:', { 
    name: product.name, 
    price: product.price, 
    compare_at_price: product.compare_at_price,
    priceType: typeof product.price 
  });

  // Sort images by sort order
  const images = product.product_images.sort(
    (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
      (a.sort_order || 0) - (b.sort_order || 0)
  );

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
          <ProductGallery images={images.map((img: { image_url: string }) => img.image_url)} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Team Badge */}
            {product.team && (
              <Link href={`/teams/${product.team.slug}`}>
                <div className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {product.team.logo_url && (
                    <Image
                      src={product.team.logo_url}
                      alt={product.team.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  )}
                  <span className="text-sm font-medium">{product.team.name}</span>
                </div>
              </Link>
            )}

            {/* Product Title & Badges */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <Badge className="bg-[#e10600]">Featured</Badge>
                )}
                {product.stock_quantity === 0 && (
                  <Badge variant="secondary">Out of Stock</Badge>
                )}
                {product.category && (
                  <Badge variant="outline">{product.category.name}</Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  <Price amount={product.price} />
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    <Price amount={product.compare_at_price} />
                  </span>
                )}
              </div>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <p className="text-sm text-[#e10600] font-medium">
                  Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                </p>
              )}
            </div>

            {/* Stock Status */}
            {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
              <p className="text-sm text-orange-600">
                Only {product.stock_quantity} left in stock!
              </p>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Add to Cart */}
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                stock_quantity: product.stock_quantity,
                has_sizes: product.has_sizes,
                sizes: sizes,
                image_url: images[0]?.image_url || null,
              }}
            />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">More from {product.team?.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => {
                const relImages = relProduct.product_images.sort(
                  (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
                    (a.sort_order || 0) - (b.sort_order || 0)
                );
                return (
                  <Link
                    key={relProduct.id}
                    href={`/products/${relProduct.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square">
                        {relImages[0]?.image_url ? (
                          <Image
                            src={relImages[0].image_url}
                            alt={relProduct.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                        <Price amount={relProduct.price} />
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
