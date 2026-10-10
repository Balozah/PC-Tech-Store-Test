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
      onClick={() => router.replace(`${pathname}${window.location.search}`, { locale: other })}
      lang={other}
      className="h-11 cursor-pointer px-3 text-sm font-semibold transition-colors hover:bg-[var(--color-muted)]"
      aria-label={other === "ar" ? "عربي، التبديل إلى العربية" : "EN, Switch to English"}
    >
      {other === "ar" ? "عربي" : "EN"}
    </button>
  );
}
