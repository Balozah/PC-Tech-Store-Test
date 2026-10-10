"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/product-card";
import type { CardExtras, Product } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

const SORTS = ["default", "newest", "price-asc", "price-desc"] as const;
type Sort = (typeof SORTS)[number];

// Sorting/filtering runs in the browser on the products already in the page:
// instant on slow connections and keeps category pages static. The choice is
// mirrored to the URL (?sort=…&stock=1) so a filtered list can be shared.
export function ProductBrowser({
  products,
  extras,
  locale,
}: {
  products: Product[];
  extras: Record<string, CardExtras>;
  locale: Locale;
}) {
  const t = useTranslations("category");
  const [sort, setSort] = useState<Sort>("default");
  const [inStock, setInStock] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("sort");
    // Restoring the shared state from the URL once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (SORTS.includes(s as Sort)) setSort(s as Sort);
    if (params.get("stock") === "1") setInStock(true);
  }, []);

  function update(next: { sort?: Sort; inStock?: boolean }) {
    const s = next.sort ?? sort;
    const stock = next.inStock ?? inStock;
    setSort(s);
    setInStock(stock);
    const url = new URL(window.location.href);
    if (s === "default") url.searchParams.delete("sort");
    else url.searchParams.set("sort", s);
    if (stock) url.searchParams.set("stock", "1");
    else url.searchParams.delete("stock");
    window.history.replaceState(window.history.state, "", url);
  }

  const visible = useMemo(() => {
    const list = inStock ? products.filter((p) => p.is_available) : [...products];
    // Products without a listed price ("on request") always sort last.
    const price = (p: Product) => (p.price_on_request ? null : p.price_usd);
    const byPrice = (dir: 1 | -1) => (a: Product, b: Product) => {
      const pa = price(a);
      const pb = price(b);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return (pa - pb) * dir;
    };
    if (sort === "newest") list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === "price-asc") list.sort(byPrice(1));
    if (sort === "price-desc") list.sort(byPrice(-1));
    return list;
  }, [products, sort, inStock]);

  const sortLabels: Record<Sort, string> = {
    default: t("sortDefault"),
    newest: t("sortNewest"),
    "price-asc": t("sortPriceAsc"),
    "price-desc": t("sortPriceDesc"),
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[var(--color-border)] py-3">
        <p className="text-sm tabular-nums text-[var(--color-ink-soft)]" aria-live="polite">
          {t("count", { count: visible.length })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex min-h-11 cursor-pointer select-none items-center gap-2 border px-3 text-sm font-medium transition-colors ${
              inStock
                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                : "border-[var(--color-border)] hover:border-[var(--color-ink)]"
            }`}
          >
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => update({ inStock: e.target.checked })}
              className="size-4 accent-current"
            />
            {t("inStock")}
          </label>
          <label className="relative inline-flex min-h-11 items-center border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus-within:border-[var(--color-ink)]">
            <span className="sr-only">{t("sort")}</span>
            <select
              value={sort}
              onChange={(e) => update({ sort: e.target.value as Sort })}
              className="h-11 cursor-pointer appearance-none bg-transparent pe-9 ps-3 font-medium outline-none"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {sortLabels[s]}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute end-3 size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[var(--color-ink-soft)]">{inStock ? t("emptyFiltered") : t("empty")}</p>
          {inStock && (
            <button
              type="button"
              onClick={() => update({ inStock: false })}
              className="mt-4 min-h-11 cursor-pointer font-semibold text-[var(--color-primary)] underline underline-offset-4"
            >
              {t("showAll")}
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {visible.map((product, i) => (
            <li key={product.id} className="enter" style={{ "--enter-delay": `${Math.min(i, 7) * 40}ms` } as React.CSSProperties}>
              <ProductCard
                product={product}
                image={extras[product.slug]?.image}
                rating={extras[product.slug]?.rating}
                locale={locale}
                priority={i < 2}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
