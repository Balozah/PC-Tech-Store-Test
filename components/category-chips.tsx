import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

// Horizontal, swipeable list of every category; the current one is inked.
export function CategoryChips({
  categories,
  activeSlug,
  locale,
  label,
}: {
  categories: Category[];
  activeSlug?: string;
  locale: Locale;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6">
      <ul className="flex w-max gap-2">
        {categories.map((c) => {
          const active = c.slug === activeSlug;
          return (
            <li key={c.id}>
              <Link
                href={`/categories/${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap border px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-ink)]"
                }`}
              >
                {locale === "ar" ? c.name_ar : c.name_en ?? c.name_ar}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
