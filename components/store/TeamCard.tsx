import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string | null;
    _count?: {
      products: number;
    };
  };
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.slug}`}>
      <Card 
        className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 p-6"
        style={{
          borderTop: `4px solid ${team.primary_color || "#e10600"}`,
        }}
      >
        <div className="flex flex-col items-center gap-4">
          {team.logo_url ? (
            <div className="relative w-24 h-24">
              <Image
                src={team.logo_url}
                alt={team.name}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {team.name[0]}
              </span>
            </div>
          )}
          <div className="text-center">
            <h3 className="font-bold text-lg group-hover:text-[#e10600] transition-colors">
              {team.name}
            </h3>
            {team._count && (
              <p className="text-sm text-muted-foreground mt-1">
                {team._count.products} Products
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
