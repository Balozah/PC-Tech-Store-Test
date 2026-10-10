"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Content renders visible on the server; only elements still below the fold at
// hydration get hidden and then revealed on scroll. On slow connections nothing
// stays invisible while JS loads. Styles live in globals.css ([data-reveal]).
export function Reveal({
  children,
  className,
  index = 0,
  step = 70,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  index?: number;
  /** Stagger between siblings in ms (DESIGN.md: 40ms grids, 60ms lists, 70ms default). */
  step?: number;
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLLIElement>}
      className={className}
      style={{ "--reveal-delay": `${Math.min(index, 9) * step}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
