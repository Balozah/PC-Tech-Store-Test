"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// Content renders visible on the server; only elements still below the fold at
// hydration get hidden and then revealed on scroll. On slow connections nothing
// stays invisible while JS loads. Styles live in globals.css ([data-reveal]).
export function Reveal({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className={className} style={{ "--reveal-delay": `${(index % 4) * 70}ms` } as CSSProperties}>
      {children}
    </div>
  );
}
