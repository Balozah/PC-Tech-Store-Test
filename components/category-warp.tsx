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
          {/* Ink scrim under the name/count only (solid for the bottom 28%, where the text sits), so
              text stays AA while the rest of the cell shows the full motion. */}
          <span className="absolute inset-0 bg-linear-to-t from-[var(--color-ink)] from-28% via-[var(--color-ink)]/55 via-48% to-transparent to-72%" />
        </>
      )}
    </span>
  );
}
