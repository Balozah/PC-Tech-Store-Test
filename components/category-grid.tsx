import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal } from "@/components/reveal";
import { CategoryWarp } from "@/components/category-warp";
import type { Category } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

// Blueprint grid: hairline cells (gap-px over the line color). Hover inverts a
// cell to ink, the reference's monochrome emphasis; on mouse devices a Warp
// shader (ink + accent) moves under the content while hovered.
export function CategoryGrid({
  categories,
  counts,
  locale,
}: {
  categories: Category[];
  counts: Record<string, number>;
  locale: Locale;
}) {
  const t = useTranslations("categories");
  const tc = useTranslations("category");

  return (
    <section id="categories" aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <h2 id="categories-title" className="font-display mb-8 text-[clamp(1.75rem,4vw,3rem)] md:mb-10">
        {t("title")}
      </h2>
      <ul className="grid grid-cols-2 gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat, i) => (
          <Reveal as="li" key={cat.id} index={i % 5} step={40} className="bg-[var(--color-background)]">
            <Link
              href={`/categories/${cat.slug}`}
              className="group relative flex aspect-[5/4] flex-col overflow-hidden justify-between p-4 transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] focus-visible:bg-[var(--color-ink)] focus-visible:text-[var(--color-paper)] sm:aspect-square sm:p-5"
            >
              <CategoryWarp index={i} />
              <CategoryIcon
                slug={cat.slug}
                className="relative size-8 transition-transform duration-200 group-hover:-translate-y-0.5 sm:size-10"
              />
              <span className="relative">
                <span className="block font-semibold leading-snug">
                  {locale === "ar" ? cat.name_ar : cat.name_en ?? cat.name_ar}
                </span>
                <span className="mt-0.5 block text-sm tabular-nums text-[var(--color-ink-soft)] transition-colors group-hover:text-[var(--color-on-dark-soft)] group-focus-visible:text-[var(--color-on-dark-soft)]">
                  {tc("count", { count: counts[cat.id] ?? 0 })}
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
