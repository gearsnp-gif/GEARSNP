"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { getImageBySize, getOptimizedImageUrl } from "@/lib/image-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function RacingLights() {
  const [activeLight, setActiveLight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLight((prev) => (prev < 5 ? prev + 1 : 0));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-2">
      {[0, 1, 2, 3, 4].map((light) => (
        <div
          key={light}
          className={`w-8 h-8 rounded-full border-2 border-gray-700 transition-all duration-200 ${
            light < activeLight
              ? "bg-[#e10600] shadow-[0_0_20px_rgba(225,6,0,0.9)]"
              : "bg-gray-800"
          }`}
        />
      ))}
    </div>
  );
}

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  if (!images || images.length === 0) {
    return (
      <Card className="aspect-square bg-muted flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </Card>
    );
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="relative aspect-square overflow-hidden bg-muted group">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <RacingLights />
          </div>
        )}
        <Image
          src={getImageBySize(images[selectedIndex], 'large')}
          alt={`Product image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority
          onLoad={() => setImageLoading(false)}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=="
        />
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </Card>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedIndex(index);
                setImageLoading(true);
              }}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? "border-[#e10600] ring-2 ring-[#e10600]/20"
                  : "border-transparent hover:border-muted-foreground/50"
              }`}
            >
              <Image
                src={getImageBySize(image, 'thumbnail')}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
