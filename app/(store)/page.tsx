import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import { TeamCard } from "@/components/store/TeamCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Trophy } from "lucide-react";

export default async function HomePage() {
  const supabase = await supabaseServer();

  // Fetch settings for hero banner and branding
  const { data: settings } = await supabase
    .from("settings")
    .select("site_name, logo_url, carousel_banner_url, primary_color, hero_title, promo_text")
    .eq("id", 1)
    .single();

  // Fetch featured products, fallback to latest if none featured
  let { data: featuredProducts, error: featuredError } = await supabase
    .from("products")
    .select(`
      *,
      teams!inner(*),
      product_images(image_url, sort_order)
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  console.log('Featured query error:', featuredError);
  console.log('Featured Products:', featuredProducts?.length || 0);

  // If no featured products, get latest products
  if (!featuredProducts || featuredProducts.length === 0) {
    const { data: latestProducts, error: latestError } = await supabase
      .from("products")
      .select(`
        *,
        teams!inner(*),
        product_images(image_url, sort_order)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);
    
    console.log('Latest query error:', latestError);
    console.log('Latest Products:', latestProducts?.length || 0);
    featuredProducts = latestProducts;
  }

  // Fetch all teams with product counts
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      products:products(count)
    `)
    .eq("is_active", true)
    .order("name");

  const teamsWithCount = teams?.map(team => ({
    ...team,
    _count: { products: team.products[0].count }
  }));

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {settings?.carousel_banner_url ? (
          <Image
            src={settings.carousel_banner_url}
            alt="Hero Banner"
            fill
            className="object-cover opacity-50"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        )}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#e10600] text-white px-4 py-2 rounded-full mb-6 text-sm font-medium">
              {settings?.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt="Logo"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              ) : (
                <Trophy className="h-4 w-4" />
              )}
              {settings?.promo_text || "Premium F1 Merchandise"}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {settings?.hero_title ? (
                <span dangerouslySetInnerHTML={{ __html: settings.hero_title.replace(/\n/g, '<br />') }} />
              ) : (
                <>
                  Gear Up for<br />
                  <span style={{ color: settings?.primary_color || "#e10600" }}>Glory</span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Official {settings?.site_name || "F1"} team merchandise, apparels, and collectibles. Show your passion on and off the track.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-[#e10600] hover:bg-[#c00500]">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/teams">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20">
                  Explore Teams
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#e10600] mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Featured</span>
              </div>
              <h2 className="text-3xl font-bold">
                {featuredProducts?.some((p: { is_featured: boolean }) => p.is_featured) ? 'Popular Products' : 'Latest Products'}
              </h2>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: { id: string; product_images: { sort_order: number | null; image_url: string }[]; teams: unknown; [key: string]: unknown }) => {
                const images = product.product_images.sort((a, b) => 
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
              <p className="text-muted-foreground">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Teams Section */}
      {teamsWithCount && teamsWithCount.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 text-[#e10600] mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Teams</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Shop by Your Favorite Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Support your team with official merchandise and exclusive gear
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {teamsWithCount.slice(0, 10).map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
            {teamsWithCount.length > 10 && (
              <div className="text-center mt-8">
                <Link href="/teams">
                  <Button variant="outline" size="lg">
                    View All Teams <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-[#e10600]" />
          <h2 className="text-4xl font-bold mb-4">Join the Racing Community</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get exclusive access to limited edition merchandise, special offers, and latest F1 updates
          </p>
          <Link href="/shop">
            <Button size="lg" className="bg-[#e10600] hover:bg-[#c00500]">
              Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
