"use client";

import { useEffect, useRef } from "react";
import { ImageDithering } from "@paper-design/shaders-react";
import type { PaperShaderElement } from "@paper-design/shaders";

// Adapted from 21st.dev paper-design "Image Dithering", recolored to the Tech
// RT tokens (DESIGN.md): ink print on paper. It is an intro and a hover
// accent only; the resting state is always the clear photo underneath.
const PAPER = "#F2F2EF";
const INK = "#0E0E10";

const INTRO_FROM = 16;
const HOVER_FROM = 7;
const SHARPEST = 1.5;
const FADE_MS = 450;

// --ease-out-expo, cubic-bezier(.16,1,.3,1), approximated for JS tweens.
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// All motion talks to the shader mount (setUniforms) and the DOM (opacity)
// directly, so nothing re-renders React per frame. The print shader is static
// (speed 0): it only redraws while a develop tween runs.
export default function DitherHeroShaders({
  image,
  coarse,
  canIntro,
  onShow,
}: {
  image: HTMLImageElement;
  coarse: boolean;
  /** False once the photo has settled: the intro is then skipped. */
  canIntro: () => boolean;
  /** Called when the print first covers the frame: the photo can appear under it. */
  onShow: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<PaperShaderElement>(null);
  const tweenRef = useRef(0);
  const fadeRef = useRef(0);

  const setOpacity = (value: number, ms: number) => {
    const el = rootRef.current;
    if (!el) return;
    el.style.transition = ms ? `opacity ${ms}ms ease-out` : "none";
    el.style.opacity = String(value);
  };

  // Print appears coarse, resolves to fine grain, then fades away to reveal
  // the photo, like a proof coming up in the tray.
  const develop = (from: number, duration: number) => {
    cancelAnimationFrame(tweenRef.current);
    clearTimeout(fadeRef.current);
    let start = 0;
    const requested = performance.now();
    const frame = (now: number) => {
      const mount = printRef.current?.paperShaderMount;
      if (!mount) {
        // The mount appears a frame or two after React commits; if it never
        // does (init failed), give up and leave the photo alone.
        if (now - requested < 1500) tweenRef.current = requestAnimationFrame(frame);
        else onShow();
        return;
      }
      if (!start) {
        start = now;
        mount.setUniforms({ u_pxSize: from });
        setOpacity(1, 0);
        onShow();
      }
      const t = Math.min((now - start) / duration, 1);
      mount.setUniforms({ u_pxSize: from + (SHARPEST - from) * easeOutExpo(t) });
      if (t < 1) tweenRef.current = requestAnimationFrame(frame);
      else fadeRef.current = window.setTimeout(() => setOpacity(0, FADE_MS), 120);
    };
    tweenRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    // Only play the intro while the photo is still arriving; a late shader
    // would turn a settled, clear photo back into pixels.
    if (canIntro()) develop(INTRO_FROM, 1300);
    else onShow();
    return () => {
      cancelAnimationFrame(tweenRef.current);
      clearTimeout(fadeRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="absolute inset-0"
      style={{ opacity: 0 }}
      onPointerEnter={(e) => !coarse && e.pointerType === "mouse" && develop(HOVER_FROM, 650)}
    >
      <ImageDithering
        ref={printRef}
        className="absolute inset-0"
        image={image}
        fit="cover"
        colorBack={PAPER}
        colorFront={INK}
        colorHighlight={INK}
        inverted
        type="4x4"
        colorSteps={1}
        size={INTRO_FROM}
        minPixelRatio={1}
        maxPixelCount={coarse ? 800_000 : 1_400_000}
      />
    </div>
  );
}
