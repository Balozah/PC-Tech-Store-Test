"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Mouse-follow glow behind the hero. Plain pointer events + CSS transitions, no
// animation library: it only runs on devices with a real mouse, so phones on slow
// connections don't download anything for it.
export function Spotlight({ className, size = 320 }: { className?: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    parent.style.position = "relative";
    parent.style.overflow = "hidden";

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      el.style.transform = `translate3d(${e.clientX - rect.left - size / 2}px, ${e.clientY - rect.top - size / 2}px, 0)`;
    };
    const onEnter = () => (el.style.opacity = "0.7");
    const onLeave = () => (el.style.opacity = "0");

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, [size]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full opacity-0 blur-3xl transition-[opacity,transform] duration-300 ease-out",
        className
      )}
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        right: "auto",
        background: "radial-gradient(circle at center, var(--color-primary), transparent 75%)",
      }}
    />
  );
}
