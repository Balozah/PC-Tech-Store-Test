"use client";

import { useEffect, useRef } from "react";
import { Warp } from "@paper-design/shaders-react";
import type { PaperShaderElement } from "@paper-design/shaders";

// Adapted from the 21st.dev "feature-shader-cards" component: same per-card
// Warp configs, recolored to Tech RT's ink + single blue accent (DESIGN.md:
// one accent, no hue palette). Used as a hover surface, never as a static
// background, so at most one runs at a time.
const INK = "#0E0E10";
const ACCENT = "#1D4ED8";
const ACCENT_ON_DARK = "#7EA6FF";

const configs = [
  { proportion: 0.3, softness: 0.8, distortion: 0.15, swirl: 0.6, swirlIterations: 8, shape: "checks", shapeScale: 0.08 },
  { proportion: 0.4, softness: 1.2, distortion: 0.2, swirl: 0.9, swirlIterations: 12, shape: "stripes", shapeScale: 0.12 },
  { proportion: 0.35, softness: 0.9, distortion: 0.18, swirl: 0.7, swirlIterations: 10, shape: "checks", shapeScale: 0.1 },
  { proportion: 0.45, softness: 1.1, distortion: 0.22, swirl: 0.8, swirlIterations: 15, shape: "stripes", shapeScale: 0.09 },
  { proportion: 0.38, softness: 0.95, distortion: 0.16, swirl: 0.85, swirlIterations: 11, shape: "checks", shapeScale: 0.11 },
] as const;

export default function WarpHover({ index = 0, className }: { index?: number; className?: string }) {
  const config = configs[index % configs.length];
  const ref = useRef<PaperShaderElement>(null);

  // Paper's dispose() removes the canvas but keeps the GL context alive until
  // GC; hovers create one per cell, so free it now instead of hitting the
  // browser's context cap (which would evict the hero's contexts first).
  useEffect(() => {
    const canvas = ref.current?.querySelector("canvas");
    return () => canvas?.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);

  return (
    <Warp
      ref={ref}
      className={className}
      {...config}
      scale={1}
      rotation={0}
      speed={0.9}
      colors={[ACCENT, ACCENT_ON_DARK, INK, ACCENT]}
      minPixelRatio={1}
      maxPixelCount={400_000}
    />
  );
}
