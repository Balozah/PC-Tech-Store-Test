import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryChips } from "@/components/category-chips";
import { CategoryIcon } from "@/components/category-icon";
import { ProductBrowser } from "@/components/product-browser";
import { getCategories, getCategoryBySlug, getProducts, getCardExtras, getSiteSettings } from "@/lib/data";
import { pageAlternates, ogLocale } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getSiteSettings()]);
  if (!category) return {};
  const name = locale === "ar" ? category.name_ar : category.name_en ?? category.name_ar;
  const brand = locale === "ar" ? settings.business_name_ar : settings.business_name_en || settings.business_name_ar;
  const title = `${name} | ${brand}`;
  const t = await getTranslations({ locale, namespace: "category" });
  const description = t("metaDescription", { name, brand });
  return {
    title,
    description,
    alternates: pageAlternates(locale, `/categories/${slug}`),
    openGraph: { title, description, ...ogLocale(locale), siteName: brand },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const [category, categories] = await Promise.all([getCategoryBySlug(slug), getCategories()]);
  if (!category) notFound();

  const [products, t, tn] = await Promise.all([
    getProducts(slug),
    getTranslations("product"),
    getTranslations("nav"),
  ]);
  const extras = await getCardExtras(products);
  const name = locale === "ar" ? category.name_ar : category.name_en ?? category.name_ar;
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
      <Breadcrumbs
        items={[{ label: t("breadcrumbHome"), href: "/" }, { label: name }]}
        siteUrl={siteUrl}
        locale={locale}
      />

      <div className="mb-8 mt-6 flex items-end justify-between gap-6 md:mb-10">
        <h1 className="font-display enter text-[clamp(2.25rem,6vw,4.5rem)]">{name}</h1>
        <CategoryIcon slug={category.slug} className="enter hidden size-16 shrink-0 sm:block" />
      </div>

      <div className="mb-6">
        <CategoryChips categories={categories} activeSlug={slug} locale={locale} label={tn("allCategories")} />
      </div>

      <ProductBrowser products={products} extras={extras} locale={locale} />
    </div>
  );
}
