"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { useState } from "react";

interface ShopFiltersProps {
  categories: { id: string; name: string }[];
  teams: { id: string; name: string; slug: string }[];
  currentFilters: {
    category?: string;
    team?: string;
    sort?: string;
    search?: string;
  };
  isMobile?: boolean;
}

export function ShopFilters({ categories, teams, currentFilters, isMobile = false }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentFilters.search || "");

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
    setSearchInput("");
    router.push("/shop");
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Update URL immediately as user types
    updateFilter("search", value || null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by handleSearchChange
  };

  const hasActiveFilters = currentFilters.category || currentFilters.team || currentFilters.sort || currentFilters.search;

  // Mobile view with dropdowns
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </form>

        <div className="flex items-center gap-2 w-full">
          {/* Sort Dropdown */}
          <Select
            value={currentFilters.sort || "newest"}
            onValueChange={(value) => updateFilter("sort", value === "newest" ? null : value)}
          >
            <SelectTrigger className="text-xs h-9 flex-1">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent align="center" side="bottom" sideOffset={4} className="w-[var(--radix-select-trigger-width)]">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low</SelectItem>
              <SelectItem value="price-desc">Price: High</SelectItem>
              <SelectItem value="name">Name: A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Team Dropdown */}
          <Select
            value={currentFilters.team || "all"}
            onValueChange={(value) => updateFilter("team", value === "all" ? null : value)}
          >
            <SelectTrigger className="text-xs h-9 flex-1">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent align="center" side="bottom" sideOffset={4} className="w-[var(--radix-select-trigger-width)] max-h-[200px]">
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Dropdown */}
          <Select
            value={currentFilters.category || "all"}
            onValueChange={(value) => updateFilter("category", value === "all" ? null : value)}
          >
            <SelectTrigger className="text-xs h-9 flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent align="center" side="bottom" sideOffset={4} className="w-[var(--radix-select-trigger-width)] max-h-[200px]">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full text-xs h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  // Desktop view with cards
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </form>
        </CardContent>
      </Card>

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
