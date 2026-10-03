import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOrder } from "@/components/product-order";
import { StarRating } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";
import { ProductCard } from "@/components/product-card";
import {
  getProducts,
  getProductBySlug,
  getProductImages,
  getProductRating,
  getSiteSettings,
} from "@/lib/data";
import type { Locale } from "@/i18n/routing";
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
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = locale === "ar" ? product.name_ar : product.name_en ?? product.name_ar;
  const description = locale === "ar" ? product.description_ar : product.description_en ?? product.description_ar;
  const image = product.images[0];

  return {
    title: `${name} — Tech RT`,
    description: description ?? undefined,
    openGraph: {
      title: name,
      description: description ?? undefined,
      locale,
      images: image ? [{ url: image.path }] : undefined,
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

  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const productUrl = `${siteUrl}/${locale}/products/${product.slug}`;

  const related = product.category_id
    ? (await getProducts(product.category?.slug)).filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const relatedImages = Object.fromEntries(
    await Promise.all(related.map(async (p) => [p.slug, (await getProductImages(p.slug))[0]]))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} alt={name} />

        <div>
          <h1 className="font-[var(--font-heading)] text-3xl font-bold sm:text-4xl">{name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StarRating value={rating.average} count={rating.count} />
            {product.is_available ? (
              <span className="rounded-full bg-[var(--color-success)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-success)]">
                {t("available")}
              </span>
            ) : (
              <span className="rounded-full bg-[var(--color-destructive)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--color-destructive)]">
                {t("unavailable")}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-4 text-[var(--color-muted-foreground)]">{description}</p>
          )}

          <div className="mt-6">
            <ProductOrder
              product={product}
              whatsappNumber={settings.whatsapp}
              productUrl={productUrl}
              locale={locale}
            />
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="mb-4 font-[var(--font-heading)] text-2xl font-bold">{t("reviews")}</h2>
        {product.reviews.length === 0 ? (
          <p className="text-[var(--color-muted-foreground)]">{t("noReviews")}</p>
        ) : (
          <ul className="space-y-4">
            {product.reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{r.author_name}</span>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
        <ReviewForm productId={product.id} />
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-[var(--font-heading)] text-2xl font-bold">{t("related")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} image={relatedImages[p.slug]} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
