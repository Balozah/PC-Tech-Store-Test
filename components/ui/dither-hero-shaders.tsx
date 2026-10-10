"use client";

import { useEffect, useRef, useState } from "react";
import { Dithering, ImageDithering } from "@paper-design/shaders-react";

// Adapted from 21st.dev paper-design "Dithering" + "Image Dithering", recolored
// to the Tech RT tokens (DESIGN.md): paper background, ink print, no hue.
const PAPER = "#F2F2EF";
const LINE = "#D6D6D1";
const INK = "#0E0E10";

const DEVELOP_FROM = 14;
const DEVELOP_TO = 2;

// --ease-out-expo, cubic-bezier(.16,1,.3,1), approximated for JS tweens.
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function DitherHeroShaders({ image, coarse }: { image: HTMLImageElement; coarse: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef(0);
  const [size, setSize] = useState(DEVELOP_FROM);
  const [active, setActive] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // "Develop": the print resolves from coarse dots to fine grain, like a photo
  // coming up in the tray. Runs on mount and again (shorter) on hover/tap.
  const develop = (from: number, duration: number) => {
    cancelAnimationFrame(tweenRef.current);
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setSize(from + (DEVELOP_TO - from) * easeOutExpo(t));
      if (t < 1) tweenRef.current = requestAnimationFrame(frame);
    };
    tweenRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    develop(DEVELOP_FROM, 1400);
    return () => cancelAnimationFrame(tweenRef.current);
  }, []);

  // The ambient layer is the only one that animates continuously: stop it when
  // the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let inView = true;
    const sync = () => setActive(inView && document.visibilityState === "visible");
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
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (coarse || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 12, y: ((e.clientY - r.top) / r.height - 0.5) * 12 });
  };

  const pixels = coarse ? { minPixelRatio: 1, maxPixelCount: 800_000 } : { minPixelRatio: 1, maxPixelCount: 1_400_000 };

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="dither-in absolute inset-0"
      onPointerEnter={(e) => e.pointerType === "mouse" && develop(8, 600)}
      onPointerDown={(e) => e.pointerType !== "mouse" && develop(8, 600)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <Dithering
        className="absolute inset-0"
        colorBack={PAPER}
        colorFront={LINE}
        shape="warp"
        type="4x4"
        size={3}
        speed={active ? (coarse ? 0.12 : 0.25) : 0}
        {...pixels}
      />
      <div
        className="absolute -inset-2 transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${tilt.x}px, ${tilt.y}px, 0)` }}
      >
        <ImageDithering
          className="absolute inset-0"
          image={image}
          fit="cover"
          colorBack="#00000000"
          colorFront={INK}
          colorHighlight={INK}
          inverted
          type="4x4"
          colorSteps={1}
          size={size}
          {...pixels}
        />
      </div>
    </div>
  );
}
