"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { canRunShaders, hasFinePointer } from "@/lib/shader-budget";

const WarpHover = dynamic(() => import("@/components/ui/warp-hover"), { ssr: false });

// Hover surface for one category cell. Listens to its parent link and mounts
// the Warp shader only while that cell is hovered or keyboard-focused, on
// mouse devices that can afford WebGL. Everywhere else the CSS invert-to-ink
// hover is the whole effect.
export function CategoryWarp({ index }: { index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const cell = ref.current?.parentElement;
    if (!cell || !hasFinePointer() || !canRunShaders()) return;
    const show = () => setOn(true);
    const hide = () => setOn(false);
    cell.addEventListener("pointerenter", show);
    cell.addEventListener("pointerleave", hide);
    cell.addEventListener("focusin", show);
    cell.addEventListener("focusout", hide);
    return () => {
      cell.removeEventListener("pointerenter", show);
      cell.removeEventListener("pointerleave", hide);
      cell.removeEventListener("focusin", show);
      cell.removeEventListener("focusout", hide);
    };
  }, []);

  return (
    <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {on && (
        <>
          <WarpHover index={index} className="shader-in absolute inset-0" />
          {/* Keeps paper text and the soft count ≥4.5:1 over the brightest blue. */}
          <span className="absolute inset-0 bg-[var(--color-ink)]/70" />
        </>
      )}
    </span>
  );
}
