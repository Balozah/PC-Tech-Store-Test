"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { canRunShaders } from "@/lib/shader-budget";
import { isHeroHeld, releaseHeroHold } from "@/lib/hero-hold";

const DitherHeroShaders = dynamic(() => import("./dither-hero-shaders"), { ssr: false });

const corners = [
  "-top-1.5 -start-1.5 border-t border-s",
  "-top-1.5 -end-1.5 border-t border-e",
  "-bottom-1.5 -start-1.5 border-b border-s",
  "-bottom-1.5 -end-1.5 border-b border-e",
];

// Hero centerpiece. The grayscale photo is server-rendered and stays the LCP
// element, the resting state, and the full fallback (no JS, reduced motion,
// Save-Data, no WebGL2). When the device can afford it, a dithered "print"
// plays first (the photo is held back before paint) and fades to the photo.
export function DitherHeroVisual({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [shader, setShader] = useState<{ image: HTMLImageElement; coarse: boolean } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // The intro only plays while the photo is still held back (see
  // lib/hero-hold.ts); once it is visible, pixels would only blur it.
  const canIntro = useCallback(() => isHeroHeld(), []);

  useEffect(() => {
    if (!canRunShaders()) {
      releaseHeroHold();
      return;
    }
    let cancelled = false;
    // Start fetching the shader chunk right away, in parallel with decoding.
    const chunk = import("./dither-hero-shaders");
    const img = imgRef.current;
    const loaded =
      img && !img.complete ? new Promise((resolve) => img.addEventListener("load", resolve, { once: true })) : Promise.resolve();
    loaded
      .then(() => {
        // Reuse the responsive file the <img> already downloaded: no second
        // request, and a texture sized to the frame instead of the 1200px master.
        const image = new window.Image();
        image.src = img?.currentSrc || src;
        return Promise.all([image.decode(), chunk]).then(() => {
          const coarse = window.matchMedia("(pointer: coarse)").matches;
          // Phones have no hover replay, so a missed intro means no shader at all.
          if (!cancelled && (!coarse || canIntro())) setShader({ image, coarse });
          else releaseHeroHold();
        });
      })
      .catch(releaseHeroHold);
    return () => {
      cancelled = true;
    };
  }, [src, canIntro]);

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
          className="hero-photo settle object-cover grayscale contrast-[1.1]"
        />
        {shader && <DitherHeroShaders image={shader.image} coarse={shader.coarse} canIntro={canIntro} onShow={releaseHeroHold} />}
      </div>
      {corners.map((c) => (
        <span key={c} aria-hidden="true" className={`pointer-events-none absolute size-3 border-[var(--color-ink)] ${c}`} />
      ))}
    </div>
  );
}
