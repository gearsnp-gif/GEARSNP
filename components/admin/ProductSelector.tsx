"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn, formatNepaliCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
  base_price: number;
  hero_image_url: string | null;
}

interface ProductSelectorProps {
  products: Product[];
  value: string;
  onValueChange: (value: string) => void;
  currentProductName?: string;
}

export function ProductSelector({
  products,
  value,
  onValueChange,
  currentProductName,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedProduct = products.find((product) => product.id === value);
  const displayName = selectedProduct?.name || currentProductName || "Select product";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2"
        >
          <span className="truncate">{displayName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  keywords={[product.name, product.id]}
                  onSelect={() => {
                    onValueChange(product.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                    {product.hero_image_url ? (
                      <Image
                        src={product.hero_image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNepaliCurrency(product.base_price)}
                    </p>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
