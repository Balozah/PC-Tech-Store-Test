import { getTranslations } from "next-intl/server";
import { CategoryChips } from "@/components/category-chips";
import { ProductCard } from "@/components/product-card";
import { SearchForm } from "@/components/search-form";
import { getCardExtras, getCategories, normalizeSearchQuery, searchProducts } from "@/lib/data";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "search" });
  // Result pages are endless URL variants: keep them out of the index.
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [{ locale }, { q: rawQuery }] = (await Promise.all([params, searchParams])) as [
    { locale: Locale },
    { q?: string | string[] },
  ];
  const q = normalizeSearchQuery(rawQuery);
  const [t, tn, results, categories] = await Promise.all([
    getTranslations("search"),
    getTranslations("nav"),
    searchProducts(q),
    getCategories(),
  ]);
  const extras = await getCardExtras(results);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 md:pt-12">
      <h1 className="font-display break-words text-[clamp(2.25rem,6vw,4.5rem)]">{q ? t("resultsFor", { q }) : t("title")}</h1>

      <SearchForm
        locale={locale}
        placeholder={t("placeholder")}
        label={t("submit")}
        defaultValue={q}
        autoFocus={!q}
        size="lg"
        className="mt-6 max-w-2xl"
      />

      {!q ? (
        <p className="mt-6 text-[var(--color-ink-soft)]">{t("prompt")}</p>
      ) : results.length === 0 ? (
        <div className="mt-10">
          <p className="mb-5 text-[var(--color-ink-soft)]">{t("empty")}</p>
          <CategoryChips categories={categories} locale={locale} label={tn("allCategories")} />
        </div>
      ) : (
        <>
          <p className="mt-10 border-y border-[var(--color-border)] py-3 text-sm tabular-nums text-[var(--color-ink-soft)]">
            {t("count", { count: results.length })}
          </p>
          <h2 className="sr-only">{t("listTitle")}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {results.map((product, i) => (
              <li key={product.id} className="enter" style={{ "--enter-delay": `${Math.min(i, 7) * 40}ms` } as React.CSSProperties}>
                <ProductCard
                  product={product}
                  image={extras[product.slug]?.image}
                  rating={extras[product.slug]?.rating}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
