"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import type { DeliveryRate } from "@/lib/delivery-rates";

interface CitySelectorProps {
  deliveryRates: readonly DeliveryRate[];
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export function CitySelector({ deliveryRates, value, onValueChange }: CitySelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal"
        >
          {value ? deliveryRates.find((rate) => rate.city === value)?.city : "Select city/district"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search city/district..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {deliveryRates.map((rate) => (
                <CommandItem
                  key={rate.city}
                  value={rate.city}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === rate.city ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {rate.city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
