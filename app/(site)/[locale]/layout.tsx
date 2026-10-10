import { ViewTransition } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { getCategories, getSiteSettings } from "@/lib/data";
import { whatsAppChatUrl } from "@/lib/whatsapp";
import type { Locale } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "@/app/globals.css";

export const viewport: Viewport = { themeColor: "#f2f2ef" };

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Tech RT", template: "%s" },
};

// Dashboard actions revalidate instantly; this catches edits made directly in Supabase.
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const [settings, categories, t] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getTranslations({ locale, namespace: "footer" }),
  ]);
  const chatUrl = whatsAppChatUrl(settings.whatsapp);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <Header categories={categories} locale={locale as Locale} />
          <ViewTransition>
            <main id="main" className="flex-1">
              {children}
            </main>
          </ViewTransition>
          <Footer settings={settings} categories={categories} locale={locale} />
          {chatUrl && <WhatsAppFab href={chatUrl} label={t("chat")} />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
