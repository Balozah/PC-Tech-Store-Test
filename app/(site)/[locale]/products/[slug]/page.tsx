import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOrder } from "@/components/product-order";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import {
  getProducts,
  getProductBySlug,
  getCardExtras,
  getProductRating,
  getSiteSettings,
} from "@/lib/data";
import type { Locale } from "@/i18n/routing";
import { productImageUrl } from "@/lib/product-image";
import { pageAlternates, ogLocale } from "@/lib/seo";
import { specRows } from "@/lib/specs";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) return {};
  const brand = locale === "ar" ? settings.business_name_ar : settings.business_name_en || settings.business_name_ar;
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;
  const description = locale === "ar" ? product.description_ar : product.description_en ?? product.description_ar;
  const image = product.images[0];

  return {
    title: `${name} | ${brand}`,
    description: description ?? undefined,
    alternates: pageAlternates(locale, `/products/${slug}`),
    openGraph: {
      title: name,
      description: description ?? undefined,
      ...ogLocale(locale),
      siteName: brand,
      images: image ? [{ url: productImageUrl(image.path) }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const t = await getTranslations("product");
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;
  const description = locale === "ar" ? product.description_ar : product.description_en ?? product.description_ar;
  const rating = getProductRating(product.reviews);
  const specs = specRows(product.specs, locale);
  const category = product.category;
  const categoryName = category ? (locale === "ar" ? category.name_ar : category.name_en ?? category.name_ar) : null;

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const productUrl = `${siteUrl}/${locale}/products/${product.slug}`;

  const related = product.category_id
    ? (await getProducts(category?.slug)).filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const relatedExtras = await getCardExtras(related);

  const crumbs: Crumb[] = [
    { label: t("breadcrumbHome"), href: "/" },
    ...(category && categoryName ? [{ label: categoryName, href: `/categories/${category.slug}` }] : []),
    { label: name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-20">
      <Breadcrumbs items={crumbs} siteUrl={siteUrl} locale={locale} />

      <div className="mt-6 grid gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <ProductGallery images={product.images} alt={name} />
        </div>

        <div className="md:col-span-5 md:self-start md:sticky md:top-24">
          {category && categoryName && (
            <Link
              href={`/categories/${category.slug}`}
              className="text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
            >
              {categoryName}
            </Link>
          )}
          <h1 className="font-display mt-2 text-[clamp(1.75rem,3.6vw,2.75rem)]">{name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${
                product.is_available
                  ? "border-[var(--color-success)] text-[var(--color-success)]"
                  : "border-[var(--color-destructive)] text-[var(--color-destructive)]"
              }`}
            >
              <span
                className={`size-1.5 ${product.is_available ? "bg-[var(--color-success)]" : "bg-[var(--color-destructive)]"}`}
                aria-hidden="true"
              />
              {product.is_available ? t("available") : t("unavailable")}
            </span>
            {rating.count > 0 && (
              <a href="#reviews" className="inline-flex min-h-8 items-center">
                <StarRating value={rating.average} count={rating.count} size={14} />
              </a>
            )}
          </div>

          {description && <p className="mt-5 text-[var(--color-ink-soft)]">{description}</p>}

          <div className="mt-6 border-t border-[var(--color-border)] pt-6">
            <ProductOrder
              product={product}
              whatsappNumber={settings.whatsapp}
              productUrl={productUrl}
              locale={locale}
            />
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <section aria-labelledby="specs-title" className="mt-20 border-t border-[var(--color-border)] pt-10">
          <h2 id="specs-title" className="font-display mb-6 text-[clamp(1.5rem,3vw,2.25rem)]">
            {t("specs")}
          </h2>
          <dl className="grid gap-px border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 bg-[var(--color-surface)] px-4 py-3.5">
                <dt className="text-[var(--color-ink-soft)]">{s.label}</dt>
                <dd className="font-semibold tabular-nums">
                  <bdi>{s.value}</bdi>
                </dd>
              </div>
            ))}
            {specs.length % 2 === 1 && <div className="hidden bg-[var(--color-surface)] sm:block" aria-hidden="true" />}
          </dl>
        </section>
      )}

      <section id="reviews" aria-labelledby="reviews-title" className="mt-20 scroll-mt-24 border-t border-[var(--color-border)] pt-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="reviews-title" className="font-display text-[clamp(1.5rem,3vw,2.25rem)]">
                {t("reviews")}
              </h2>
              {rating.count > 0 && <StarRating value={rating.average} count={rating.count} />}
            </div>
            {product.reviews.length === 0 ? (
              <p className="mt-4 text-[var(--color-ink-soft)]">{t("noReviews")}</p>
            ) : (
              <ul className="mt-6 border-t border-[var(--color-border)]">
                {product.reviews.map((r) => (
                  <li key={r.id} className="border-b border-[var(--color-border)] py-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{r.author_name}</span>
                      <StarRating value={r.rating} size={14} />
                    </div>
                    {r.comment && <p className="mt-2 text-[var(--color-ink-soft)]">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="md:col-span-5">
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20">
          <h2 id="related-title" className="font-display mb-8 text-[clamp(1.5rem,3vw,2.25rem)]">
            {t("related")}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((p, i) => (
              <Reveal as="li" key={p.id} index={i} step={60}>
                <ProductCard
                  product={p}
                  image={relatedExtras[p.slug]?.image}
                  rating={relatedExtras[p.slug]?.rating}
                  locale={locale}
                />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
