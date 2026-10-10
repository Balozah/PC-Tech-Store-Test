import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function Header() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          {t("brand.name")}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">
            {t("nav.home")}
          </Link>
          <Link href="/#categories" className="hover:text-[var(--color-primary)] transition-colors">
            {t("nav.categories")}
          </Link>
          <Link href="/#contact" className="hover:text-[var(--color-primary)] transition-colors">
            {t("nav.contact")}
          </Link>
        </nav>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
