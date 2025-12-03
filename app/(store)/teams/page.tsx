import { supabaseServer } from "@/lib/supabase/server";
import { TeamCard } from "@/components/store/TeamCard";

export default async function TeamsPage() {
  const supabase = await supabaseServer();

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">F1 Teams</h1>
          <p className="text-muted-foreground">
            Shop gear from your favorite F1 teams
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="container mx-auto px-4 py-8">
        {teamsWithCount && teamsWithCount.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {teamsWithCount.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <span className="text-2xl">🏁</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No teams available</h3>
            <p className="text-muted-foreground">
              Teams will appear here once they are added.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
