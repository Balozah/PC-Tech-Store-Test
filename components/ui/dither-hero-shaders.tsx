"use client";

import { useEffect, useRef } from "react";
import { Dithering, ImageDithering } from "@paper-design/shaders-react";
import type { PaperShaderElement } from "@paper-design/shaders";

// Adapted from 21st.dev paper-design "Dithering" + "Image Dithering", recolored
// to the Tech RT tokens (DESIGN.md): paper background, ink print, no hue.
const PAPER = "#F2F2EF";
const LINE = "#D6D6D1";
const INK = "#0E0E10";

const DEVELOP_FROM = 14;
const DEVELOP_TO = 2;
const AMBIENT_SPEED = 0.25;

// --ease-out-expo, cubic-bezier(.16,1,.3,1), approximated for JS tweens.
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

// All motion here talks to the shader mounts directly (setUniforms/setSpeed)
// and to the DOM (tilt), so nothing re-renders React per frame.
export default function DitherHeroShaders({ image, coarse }: { image: HTMLImageElement; coarse: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<PaperShaderElement>(null);
  const ambientRef = useRef<PaperShaderElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef(0);

  // "Develop": the print resolves from coarse dots to fine grain, like a photo
  // coming up in the tray. Runs on mount and again (shorter) on hover/tap. The
  // print shader is static (speed 0), so it only redraws while this runs.
  const develop = (from: number, duration: number) => {
    cancelAnimationFrame(tweenRef.current);
    const start = performance.now();
    const frame = (now: number) => {
      const mount = printRef.current?.paperShaderMount;
      if (!mount) {
        tweenRef.current = requestAnimationFrame(frame);
        return;
      }
      const t = Math.min((now - start) / duration, 1);
      mount.setUniforms({ u_pxSize: from + (DEVELOP_TO - from) * easeOutExpo(t) });
      if (t < 1) tweenRef.current = requestAnimationFrame(frame);
    };
    tweenRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    develop(DEVELOP_FROM, 1400);
    return () => cancelAnimationFrame(tweenRef.current);
  }, []);

  // The ambient layer (desktop only) is the one continuous animation: stop it
  // when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || coarse) return;
    let inView = true;
    const sync = () =>
      ambientRef.current?.paperShaderMount?.setSpeed(inView && document.visibilityState === "visible" ? AMBIENT_SPEED : 0);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [coarse]);

  const setTilt = (x: number, y: number) => {
    if (tiltRef.current) tiltRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt(((e.clientX - r.left) / r.width - 0.5) * 12, ((e.clientY - r.top) / r.height - 0.5) * 12);
  };

  const pixels = coarse ? { minPixelRatio: 1, maxPixelCount: 800_000 } : { minPixelRatio: 1, maxPixelCount: 1_400_000 };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="shader-in absolute inset-0"
      style={coarse ? { background: PAPER } : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && develop(8, 600)}
      onPointerDown={(e) => e.pointerType !== "mouse" && develop(8, 600)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt(0, 0)}
    >
      {!coarse && (
        <Dithering
          ref={ambientRef}
          className="absolute inset-0"
          colorBack={PAPER}
          colorFront={LINE}
          shape="warp"
          type="4x4"
          size={3}
          speed={AMBIENT_SPEED}
          {...pixels}
        />
      )}
      <div ref={tiltRef} className="absolute -inset-2 transition-transform duration-300 ease-out">
        <ImageDithering
          ref={printRef}
          className="absolute inset-0"
          image={image}
          fit="cover"
          colorBack="#00000000"
          colorFront={INK}
          colorHighlight={INK}
          inverted
          type="4x4"
          colorSteps={1}
          size={DEVELOP_FROM}
          {...pixels}
        />
      </div>
    </div>
  );
}
