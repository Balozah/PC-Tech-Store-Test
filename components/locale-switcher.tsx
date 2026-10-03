"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const other = routing.locales.find((l) => l !== locale)!;

  return (
    <button
      onClick={() => router.replace(pathname, { locale: other })}
      className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:border-[var(--color-primary)] transition-colors cursor-pointer"
      aria-label="Switch language"
    >
      {other === "ar" ? "العربية" : "English"}
    </button>
  );
}
