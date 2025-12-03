import { supabaseServer } from "@/lib/supabase/server";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopPagination } from "@/components/store/ShopPagination";

interface SearchParams {
  category?: string;
  team?: string;
  sort?: string;
  page?: string;
  search?: string;
}

const ITEMS_PER_PAGE = 12;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await supabaseServer();
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;

  // Build query
  let query = supabase
    .from("products")
    .select(`
      *,
      team:teams(*),
      product_images(image_url, sort_order),
      category:categories(*)
    `, { count: "exact" })
    .eq("is_active", true);

  // Apply filters
  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  if (params.team) {
    query = query.eq("team_id", params.team);
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  // Apply sorting
  switch (params.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

  const { data: products, count } = await query;

  // Fetch categories and teams for filters
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Shop All Products</h1>
          <p className="text-muted-foreground">
            {count ? `${count} products available` : "Loading products..."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filters */}
        <div className="lg:hidden mb-6">
          <ShopFilters
            categories={categories || []}
            teams={teams || []}
            currentFilters={{
              category: params.category,
              team: params.team,
              sort: params.sort,
              search: params.search,
            }}
            isMobile
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <ShopFilters
              categories={categories || []}
              teams={teams || []}
              currentFilters={{
                category: params.category,
                team: params.team,
                sort: params.sort,
                search: params.search,
              }}
            />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                          image_url: images[0]?.image_url || null,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <ShopPagination
                      currentPage={page}
                      totalPages={totalPages}
                      searchParams={params as Record<string, string | undefined>}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
