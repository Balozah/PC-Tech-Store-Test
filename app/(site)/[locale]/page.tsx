import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/hero";
import { Spotlight } from "@/components/spotlight";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import { HowToOrder } from "@/components/how-to-order";
import { Reveal } from "@/components/reveal";
import { getCategories, getProducts, getCardExtras, getSiteSettings } from "@/lib/data";
import { productImageUrl } from "@/lib/product-image";
import { whatsAppChatUrl } from "@/lib/whatsapp";
import { pageAlternates } from "@/lib/seo";
import { specRows } from "@/lib/specs";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

const PREBUILT_SLUG = "pre-built-pcs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const settings = await getSiteSettings();
  const brand = locale === "ar" ? settings.business_name_ar : settings.business_name_en || settings.business_name_ar;
  const title = locale === "ar" ? `${brand} — قطع كمبيوتر وتجميعات` : `${brand} — PC Parts & Builds`;
  const description =
    locale === "ar"
      ? "قطع كمبيوتر، لابتوبات، تجميعات جاهزة وإكسسوارات — اطلب عبر واتساب."
      : "PC parts, laptops, pre-built rigs and accessories — order on WhatsApp.";
  return {
    title,
    description,
    alternates: pageAlternates(locale, ""),
    openGraph: {
      title,
      description,
      locale,
      siteName: brand,
      type: "website",
      images: [{ url: "/api/og", width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const tp = await getTranslations("product");

  const [categories, products, settings] = await Promise.all([getCategories(), getProducts(), getSiteSettings()]);

  // Owner-controlled picks: the featured band shows the first product marked
  // "price on request" at the top of its category; the hero shows the first
  // pre-built PC, so replacing that product's photo replaces the hero.
  const featured = products.find((p) => p.sort_order === 1 && p.price_on_request) ?? products[0];
  const prebuiltCategory = categories.find((c) => c.slug === PREBUILT_SLUG);
  const heroProduct = products.find((p) => p.category_id === prebuiltCategory?.id) ?? featured;
  const latest = [...products]
    .filter((p) => p.id !== featured?.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  const counts: Record<string, number> = {};
  for (const p of products) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;

  const extras = await getCardExtras(
    [featured, heroProduct, ...latest].filter((p, i, all) => p && all.findIndex((q) => q?.id === p.id) === i)
  );
  const heroImage = heroProduct ? extras[heroProduct.slug]?.image : undefined;
  const chatUrl = whatsAppChatUrl(settings.whatsapp);

  return (
    <>
      <Hero
        imageUrl={heroImage ? productImageUrl(heroImage.path) : undefined}
        chatUrl={chatUrl}
        prebuiltHref={prebuiltCategory ? `/categories/${PREBUILT_SLUG}` : "/#categories"}
      />

      {featured && <Spotlight product={featured} image={extras[featured.slug]?.image} specs={specRows(featured.specs, locale).slice(0, 4)} locale={locale} />}

      <CategoryGrid categories={categories} counts={counts} locale={locale} />

      {latest.length > 0 && (
        <section aria-labelledby="latest-title" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
          <h2 id="latest-title" className="font-display mb-8 text-[clamp(1.75rem,4vw,3rem)] md:mb-10">
            {tp("latest")}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {latest.map((product, i) => (
              <Reveal as="li" key={product.id} index={i % 4} step={60}>
                <ProductCard
                  product={product}
                  image={extras[product.slug]?.image}
                  rating={extras[product.slug]?.rating}
                  locale={locale}
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <HowToOrder chatUrl={chatUrl} />
    </>
  );
}
