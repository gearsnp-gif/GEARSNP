"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ShopFiltersProps {
  categories: { id: string; name: string }[];
  teams: { id: string; name: string; slug: string }[];
  currentFilters: {
    category?: string;
    team?: string;
    sort?: string;
    search?: string;
  };
}

export function ShopFilters({ categories, teams, currentFilters }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    params.set("page", "1");
    
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/shop");
  };

  const hasActiveFilters = currentFilters.category || currentFilters.team || currentFilters.sort;

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-auto p-1"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentFilters.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {categories.find((c) => c.id === currentFilters.category)?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter("category", null)}
                  className="h-auto p-0.5"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {currentFilters.team && (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {teams.find((t) => t.id === currentFilters.team)?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter("team", null)}
                  className="h-auto p-0.5"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sort */}
      <Card>
        <CardHeader>
          <CardTitle>Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.sort || "newest"}
            onValueChange={(value: string) => updateFilter("sort", value === "newest" ? null : value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="newest" />
              <Label htmlFor="newest" className="cursor-pointer">
                Newest First
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-asc" id="price-asc" />
              <Label htmlFor="price-asc" className="cursor-pointer">
                Price: Low to High
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-desc" id="price-desc" />
              <Label htmlFor="price-desc" className="cursor-pointer">
                Price: High to Low
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="name" id="name" />
              <Label htmlFor="name" className="cursor-pointer">
                Name: A to Z
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={currentFilters.category === category.id}
                  onCheckedChange={(checked) =>
                    updateFilter("category", checked ? category.id : null)
                  }
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Teams */}
      {teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`team-${team.id}`}
                  checked={currentFilters.team === team.id}
                  onCheckedChange={(checked) =>
                    updateFilter("team", checked ? team.id : null)
                  }
                />
                <Label
                  htmlFor={`team-${team.id}`}
                  className="text-sm cursor-pointer"
                >
                  {team.name}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
