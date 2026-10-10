"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import { CloseIcon, MenuIcon, ChevronIcon } from "@/components/icons";
import { CategoryIcon } from "@/components/category-icon";

type Labels = { open: string; close: string; categories: string; contact: string };

// Slides in from the inline-start edge (right in Arabic). Mounted only while
// open, so the closed state costs no DOM or layout. Portaled to <body>: the
// header's backdrop-filter would otherwise trap this fixed panel inside it.
export function MobileMenu({
  categories,
  labels,
}: {
  categories: { slug: string; name: string }[];
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastPath = useRef(pathname);

  // Close when navigation lands on a new page.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const toggle = toggleRef.current;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);
  const linkClass =
    "menu-item flex min-h-12 items-center justify-between gap-3 border-b border-[var(--color-border)] py-3 font-medium";

  const panel = (
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={labels.open} className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className="menu-backdrop absolute inset-0 cursor-default bg-[var(--color-ink)]/50"
      />
      <div className="menu-panel absolute inset-y-0 start-0 flex w-[min(22rem,88vw)] flex-col bg-[var(--color-paper)]">
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <span className="font-display text-lg">{labels.categories}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="grid size-11 cursor-pointer place-items-center hover:bg-[var(--color-muted)]"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-8">
          <ul>
            {categories.map((c, i) => (
              <li key={c.slug} style={{ "--i": i } as CSSProperties}>
                <Link href={`/categories/${c.slug}`} onClick={close} className={linkClass}>
                  <span className="flex items-center gap-3">
                    <CategoryIcon slug={c.slug} className="size-5 text-[var(--color-ink-soft)]" />
                    {c.name}
                  </span>
                  <ChevronIcon className="size-4 text-[var(--color-ink-soft)] rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
            <li style={{ "--i": categories.length } as CSSProperties}>
              <Link href="/#contact" onClick={close} className={linkClass}>
                {labels.contact}
                <ChevronIcon className="size-4 text-[var(--color-ink-soft)] rtl:-scale-x-100" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.open}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="grid size-11 cursor-pointer place-items-center transition-colors hover:bg-[var(--color-muted)] md:hidden"
      >
        <MenuIcon className="size-6" />
      </button>

      {open && createPortal(panel, document.body)}
    </>
  );
}
