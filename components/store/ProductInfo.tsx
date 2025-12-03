"use client";

import { AddToCartButton } from "@/components/store/AddToCartButton";
import { Price } from "@/components/store/Price";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    base_price: number;
    compare_at_price: number | null;
    stock: number;
    is_featured: boolean;
    has_sizes: boolean;
    hero_image_url: string | null;
    team: {
      name: string;
      slug: string;
      logo_url: string | null;
    } | null;
    category: {
      name: string;
    } | null;
  };
  sizes: Array<{
    id: string;
    size: string;
    stock: number;
    price_modifier: number;
  }>;
}

export function ProductInfo({ product, sizes }: ProductInfoProps) {
  return (
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
          {product.stock === 0 && (
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
            <Price amount={product.base_price} />
          </span>
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <span className="text-xl text-muted-foreground line-through">
              <Price amount={product.compare_at_price} />
            </span>
          )}
        </div>
        {product.compare_at_price && product.compare_at_price > product.base_price && (
          <p className="text-sm text-[#e10600] font-medium">
            Save {Math.round(((product.compare_at_price - product.base_price) / product.compare_at_price) * 100)}%
          </p>
        )}
      </div>

      {/* Stock Status */}
      {product.stock > 0 && product.stock <= 10 && (
        <p className="text-sm text-orange-600">
          Only {product.stock} left in stock!
        </p>
      )}

      <Separator />

      {/* Add to Cart */}
      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          base_price: product.base_price,
          stock_quantity: product.stock,
          has_sizes: product.has_sizes,
          sizes: sizes,
          image_url: product.hero_image_url,
        }}
      />

      {/* Description */}
      {product.description && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}
