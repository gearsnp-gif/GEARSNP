import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Price } from "./Price";
import { getImageBySize } from "@/lib/image-utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    hero_image_url: string | null;
    base_price: number;
    compare_at_price: number | null;
    stock: number;
    is_featured: boolean;
    category?: { name: string } | null;
    team?: { name: string; logo_url: string | null } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-card h-full flex flex-col p-0">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {product.hero_image_url ? (
            <Image
              src={getImageBySize(product.hero_image_url, 'card')}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=="
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
          {product.is_featured && (
            <Badge className="absolute top-2 right-2 bg-[#e10600]">Featured</Badge>
          )}
          {product.stock <= 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive">Out of Stock</Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-[#e10600] transition-colors mb-1">
            {product.name}
          </h3>
          <Price amount={product.base_price} compareAt={product.compare_at_price || undefined} />
        </CardContent>
      </Card>
    </Link>
  );
}
