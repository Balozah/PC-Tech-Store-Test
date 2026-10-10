import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal } from "@/components/reveal";
import type { Category } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

export function CategoryGrid({ categories, locale }: { categories: Category[]; locale: Locale }) {
  const t = useTranslations("categories");

  return (
    <section id="categories" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 font-display text-3xl font-bold sm:text-4xl">
        {t("title")}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} index={i}>
            <Link
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center transition-colors hover:border-[var(--color-primary)]"
            >
              <CategoryIcon
                slug={cat.slug}
                className="h-10 w-10 text-[var(--color-primary)] transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-medium">
                {locale === "ar" ? cat.name_ar : cat.name_en ?? cat.name_ar}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
