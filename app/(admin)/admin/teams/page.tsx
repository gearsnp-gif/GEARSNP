import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTeamDialog } from "@/components/admin/teams/AddTeamDialog";
import { EditTeamDialog } from "@/components/admin/teams/EditTeamDialog";
import { DeleteTeamButton } from "@/components/admin/teams/DeleteTeamButton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default async function TeamsPage() {
  const supabase = await supabaseServer();
  
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">Manage F1 teams</p>
        </div>
        <AddTeamDialog />
      </div>

      {!teams || teams.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No teams found. Add your first team to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {team.logo_url && (
                        <Image
                          src={team.logo_url}
                          alt={team.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      )}
                      {team.name}
                    </CardTitle>
                    <CardDescription>/{team.slug}</CardDescription>
                  </div>
                  {team.is_active ? (
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: team.primary_color }}
                    title="Primary color"
                  />
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: team.secondary_color }}
                    title="Secondary color"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {team.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {team.description}
                  </p>
                )}
                <div className="flex gap-2 justify-end">
                  <EditTeamDialog team={team} />
                  <DeleteTeamButton
                    teamId={team.id}
                    teamName={team.name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
