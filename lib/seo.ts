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

// Open Graph wants language_TERRITORY; the other language is listed as an alternate.
const OG_LOCALES: Record<Locale, string> = { ar: "ar_SY", en: "en_US" };

export function ogLocale(locale: Locale) {
  return {
    locale: OG_LOCALES[locale],
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
  };
}
