import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await supabaseServer();
  const { slug } = await params;

  // Fetch team data
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (teamError || !team) {
    notFound();
  }

  // Fetch products for this team
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      teams!inner(*),
      product_images(image_url, sort_order)
    `)
    .eq("team_id", team.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/teams">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
        </div>
      </div>

      {/* Team Header */}
      <div 
        className="py-16 border-b"
        style={{ 
          background: `linear-gradient(135deg, ${team.primary_color || '#e10600'}20 0%, transparent 100%)`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
            {team.logo_url && (
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-white rounded-lg p-4 shadow-lg">
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{team.name}</h1>
              <p className="text-lg text-muted-foreground">
                Official team merchandise and gear
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const images = product.product_images.sort(
                (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
                  (a.sort_order || 0) - (b.sort_order || 0)
              );
              return (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    team: product.teams,
                    image_url: images[0]?.image_url || null,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products available for this team yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
