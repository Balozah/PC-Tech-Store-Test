import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroTitle } from "@/components/hero-title";
import { Spotlight } from "@/components/spotlight";
import { CategoryGrid } from "@/components/category-grid";
import { ProductCard } from "@/components/product-card";
import { AnimatedSection } from "@/components/animated-section";
import { getCategories, getProducts, getProductImages } from "@/lib/data";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const title = locale === "ar" ? "Tech RT — قطع كمبيوتر وتجميعات" : "Tech RT — PC Parts & Builds";
  const description =
    locale === "ar"
      ? "قطع كمبيوتر، لابتوبات، تجميعات جاهزة وإكسسوارات — اطلب عبر واتساب."
      : "PC parts, laptops, pre-built rigs and accessories — order on WhatsApp.";
  return {
    title,
    description,
    openGraph: { title, description, locale },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations("hero");

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = products.find((p) => p.sort_order === 1 && p.price_on_request) ?? products[0];
  const gridProducts = products.filter((p) => p.id !== featured?.id).slice(0, 8);

  const imagesByProduct = Object.fromEntries(
    await Promise.all(
      [featured, ...gridProducts].filter(Boolean).map(async (p) => {
        const images = await getProductImages(p!.slug);
        return [p!.slug, images[0]];
      })
    )
  );

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)]">
          {t("eyebrow")}
        </p>
        <HeroTitle
          text={t("title")}
          className="mt-3 max-w-3xl font-[var(--font-heading)] text-4xl font-extrabold leading-tight sm:text-6xl"
        />
        <AnimatedSection delay={0.3}>
          <p className="mt-6 max-w-xl text-lg text-[var(--color-muted-foreground)]">
            {t("subtitle")}
          </p>
          <Link
            href="/#categories"
            className="mt-8 inline-block rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            {t("cta")}
          </Link>
        </AnimatedSection>
      </section>

      {featured && <Spotlight product={featured} image={imagesByProduct[featured.slug]} locale={locale} />}

      <CategoryGrid categories={categories} locale={locale} />

      {gridProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {gridProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                image={imagesByProduct[product.slug]}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
