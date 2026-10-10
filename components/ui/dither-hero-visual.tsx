"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { canRunShaders } from "@/lib/shader-budget";

const DitherHeroShaders = dynamic(() => import("./dither-hero-shaders"), { ssr: false });

const corners = [
  "-top-1.5 -start-1.5 border-t border-s",
  "-top-1.5 -end-1.5 border-t border-e",
  "-bottom-1.5 -start-1.5 border-b border-s",
  "-bottom-1.5 -end-1.5 border-b border-e",
];

// Hero centerpiece. The grayscale photo is server-rendered and stays the LCP
// element and the full fallback (no JS, reduced motion, Save-Data, no WebGL).
// When the device can afford it, a dithered "print" of the same photo is laid
// over it after the page has settled.
export function DitherHeroVisual({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [shader, setShader] = useState<{ image: HTMLImageElement; coarse: boolean } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canRunShaders()) return;
    let cancelled = false;
    const start = () => {
      // Reuse the responsive file the <img> already downloaded: no second
      // request, and a texture sized to the frame instead of the 1200px master.
      const image = new window.Image();
      image.src = imgRef.current?.currentSrc || src;
      image
        .decode()
        .then(() => {
          if (!cancelled) setShader({ image, coarse: window.matchMedia("(pointer: coarse)").matches });
        })
        .catch(() => {});
    };
    // Wait for load + an idle slot so the shader never competes with the LCP.
    const schedule = () =>
      "requestIdleCallback" in window ? window.requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
    };
  }, [src]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="relative aspect-square overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]">
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 34vw"
          className="settle object-cover grayscale contrast-[1.1]"
        />
        {shader && <DitherHeroShaders image={shader.image} coarse={shader.coarse} />}
      </div>
      {corners.map((c) => (
        <span key={c} aria-hidden="true" className={`pointer-events-none absolute size-3 border-[var(--color-ink)] ${c}`} />
      ))}
    </div>
  );
}
