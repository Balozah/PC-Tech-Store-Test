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
      <div className="relative aspect-square w-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        {current && (
          <Image
            key={current.id}
            src={productImageUrl(current.path)}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 58vw"
            className="enter object-contain p-6 sm:p-10"
          />
        )}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${alt} ${i + 1}/${images.length}`}
                aria-current={i === active}
                className={`relative block size-16 cursor-pointer overflow-hidden border bg-[var(--color-surface)] transition-colors sm:size-20 ${
                  i === active ? "border-[var(--color-ink)] outline outline-1 outline-[var(--color-ink)]" : "border-[var(--color-border)] hover:border-[var(--color-ink)]"
                }`}
              >
                <Image src={productImageUrl(img.path)} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
