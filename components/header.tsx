import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchForm } from "@/components/search-form";
import { SearchIcon } from "@/components/icons";
import type { Category } from "@/lib/data";
import type { Locale } from "@/i18n/routing";

export function Wordmark({ name, className }: { name: string; className?: string }) {
  // Text wordmark until the client's logo arrives (brief todo). The first word
  // sits in an ink block, echoing the reference's inverted logotype.
  const [first, ...rest] = name.split(" ");
  return (
    <span dir="ltr" className={`font-wordmark inline-flex items-center gap-1.5 text-lg leading-none ${className ?? ""}`}>
      <span className="bg-[var(--color-foreground)] px-1.5 py-1 text-[var(--color-background)]">{first}</span>
      {rest.length > 0 && <span>{rest.join(" ")}</span>}
    </span>
  );
}

export function Header({ categories, locale }: { categories: Category[]; locale: Locale }) {
  const t = useTranslations();
  const menuCategories = categories.map((c) => ({
    slug: c.slug,
    name: locale === "ar" ? c.name_ar : c.name_en ?? c.name_ar,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-[var(--color-paper)]"
      >
        {t("nav.skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label={t("brand.name")} className="shrink-0">
          <Wordmark name={t("brand.name")} />
        </Link>

        <nav aria-label={t("nav.menu")} className="ms-6 hidden items-center gap-1 text-[0.9375rem] font-medium md:flex">
          <Link href="/#categories" className="px-3 py-2 transition-colors hover:text-[var(--color-primary)]">
            {t("nav.categories")}
          </Link>
          <Link href="/#contact" className="px-3 py-2 transition-colors hover:text-[var(--color-primary)]">
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <SearchForm
            locale={locale}
            placeholder={t("search.placeholder")}
            label={t("search.submit")}
            className="hidden w-64 lg:flex xl:w-80"
          />
          <Link
            href="/search"
            aria-label={t("nav.search")}
            className="grid size-11 place-items-center transition-colors hover:bg-[var(--color-muted)] lg:hidden"
          >
            <SearchIcon className="size-5" />
          </Link>
          <LocaleSwitcher />
          <MobileMenu
            categories={menuCategories}
            labels={{
              open: t("nav.menu"),
              close: t("nav.close"),
              categories: t("nav.allCategories"),
              contact: t("nav.contact"),
            }}
          />
        </div>
      </div>
    </header>
  );
}
