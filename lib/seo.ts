import { routing, type Locale } from "@/i18n/routing";

// Canonical + hreflang links so Google pairs the /ar and /en versions of each page.
export function pageAlternates(locale: Locale, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}
