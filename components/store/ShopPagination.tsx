"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function ShopPagination({
  currentPage,
  totalPages,
  searchParams,
}: ShopPaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });
    
    params.set("page", page.toString());
    return `/shop?${params.toString()}`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <Link href={currentPage > 1 ? buildUrl(currentPage - 1) : "#"}>
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === 1}
          className="disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <Link key={index} href={buildUrl(page)}>
            <Button
              variant={currentPage === page ? "default" : "outline"}
              className={currentPage === page ? "bg-[#e10600] hover:bg-[#c00500]" : ""}
            >
              {page}
            </Button>
          </Link>
        ) : (
          <span key={index} className="px-2">
            {page}
          </span>
        )
      )}

      {/* Next Button */}
      <Link href={currentPage < totalPages ? buildUrl(currentPage + 1) : "#"}>
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage === totalPages}
          className="disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
