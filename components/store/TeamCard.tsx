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
        className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 h-full p-0"
        style={{
          borderTop: `4px solid ${team.primary_color || "#e10600"}`,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Container with background */}
          <div className="h-[180px] flex items-center justify-center p-6 bg-white">
            {team.logo_url ? (
              <div className="relative w-32 h-32">
                <Image
                  src={team.logo_url}
                  alt={team.name}
                  fill
                  sizes="128px"
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground">
                  {team.name[0]}
                </span>
              </div>
            )}
          </div>
          {/* Text Container */}
          <div className="text-center p-4 bg-card">
            <h3 className="font-bold text-base group-hover:text-[#e10600] transition-colors line-clamp-2">
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
