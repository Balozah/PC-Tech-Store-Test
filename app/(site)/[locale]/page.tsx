import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroTitle } from "@/components/hero-title";
import { Spotlight } from "@/components/spotlight";
import { Spotlight as GlowSpotlight } from "@/components/ui/spotlight";
import { HeroTiltCard } from "@/components/hero-tilt-card";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { getCategories, getProducts, getCardExtras, getSiteSettings } from "@/lib/data";
import { pageAlternates } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

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
  const t = await getTranslations("hero");
  const tp = await getTranslations("product");

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = products.find((p) => p.sort_order === 1 && p.price_on_request) ?? products[0];
  const gridProducts = products.filter((p) => p.id !== featured?.id).slice(0, 8);

  const extras = await getCardExtras(featured ? [featured, ...gridProducts] : gridProducts);

  return (
    <>
      <section className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 md:gap-16">
        <GlowSpotlight className="-top-20 start-1/4" size={420} />

        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
            {t("eyebrow")}
          </p>
          <HeroTitle
            text={t("title")}
            className="mt-3 font-[var(--font-heading)] text-4xl font-extrabold leading-tight sm:text-6xl"
          />
          <div className="enter" style={{ "--enter-delay": "300ms" } as React.CSSProperties}>
            <p className="mt-6 max-w-xl text-lg text-[var(--color-muted-foreground)]">
              {t("subtitle")}
            </p>
            <Link
              href="/#categories"
              className="mt-8 inline-block rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              {t("cta")}
            </Link>
          </div>
        </div>

        <div className="relative z-10">
          <HeroTiltCard
            src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=900&h=900&q=80&fit=crop&auto=format"
            alt={locale === "ar" ? "تجميعة كمبيوتر بإضاءة RGB" : "RGB gaming PC build"}
          />
        </div>
      </section>

      {featured && <Spotlight product={featured} image={extras[featured.slug]?.image} locale={locale} />}

      <CategoryGrid categories={categories} locale={locale} />

      {gridProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="mb-8 font-[var(--font-heading)] text-3xl font-bold sm:text-4xl">{tp("latest")}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {gridProducts.map((product, i) => (
              <Reveal key={product.id} index={i}>
                <ProductCard
                  product={product}
                  image={extras[product.slug]?.image}
                  rating={extras[product.slug]?.rating}
                  locale={locale}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
