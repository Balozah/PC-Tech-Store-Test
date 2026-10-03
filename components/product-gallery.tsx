"use client";

import { useState } from "react";
import Image from "next/image";
import { productImageUrl } from "@/lib/product-image";
import type { ProductImage } from "@/lib/data";

export function ProductGallery({ images, alt }: { images: ProductImage[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[var(--color-card-light)]">
        {current && (
          <Image
            src={productImageUrl(current.path)}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                i === active ? "border-[var(--color-primary)]" : "border-transparent"
              }`}
            >
              <Image src={productImageUrl(img.path)} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
