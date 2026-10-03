"use client";

import { useRef } from "react";
import Image from "next/image";

// Mouse-reactive 3D tilt for the hero visual using a CSS transform only — no 3D
// runtime or animation library, so phones on slow connections pay nothing for it.
export function HeroTiltCard({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function canTilt() {
    return (
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !canTilt()) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-y * 20}deg) rotateY(${x * 20}deg)`;
  }

  function handleMouseLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="enter-scale relative aspect-square w-full overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-2xl shadow-black/40 transition-transform duration-200 ease-out"
    >
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/40 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs font-medium text-white/80">Tech RT</p>
      </div>
    </div>
  );
}
