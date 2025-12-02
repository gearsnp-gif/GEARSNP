"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { ManageSizesDialog } from "./ManageSizesDialog";

interface ManageSizesButtonProps {
  product: {
    id: string;
    name: string;
    has_sizes: boolean;
  };
  onSuccess?: () => void;
}

export function ManageSizesButton({ product, onSuccess }: ManageSizesButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings2 className="h-4 w-4" />
        Sizes
      </Button>
      <ManageSizesDialog
        product={product}
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          router.refresh();
          onSuccess?.();
        }}
      />
    </>
  );
}
