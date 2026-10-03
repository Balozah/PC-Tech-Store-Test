import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { AnimatedStagger, AnimatedStaggerItem } from "@/components/animated-section";
import { getCategories, getCategoryBySlug, getProducts, getProductImages } from "@/lib/data";
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
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const name = locale === "ar" ? category.name_ar : category.name_en ?? category.name_ar;
  return { title: `${name} — Tech RT`, openGraph: { locale } };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts(slug);
  const imagesByProduct = Object.fromEntries(
    await Promise.all(
      products.map(async (p) => [p.slug, (await getProductImages(p.slug))[0]])
    )
  );

  const name = locale === "ar" ? category.name_ar : category.name_en ?? category.name_ar;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-[var(--font-heading)] text-3xl font-bold sm:text-4xl">{name}</h1>
      {products.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)]">
          {locale === "ar" ? "لا توجد منتجات بهذا القسم حالياً." : "No products in this category yet."}
        </p>
      ) : (
        <AnimatedStagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <AnimatedStaggerItem key={product.id}>
              <ProductCard product={product} image={imagesByProduct[product.slug]} locale={locale} />
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      )}
    </div>
  );
}
