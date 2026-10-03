import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({ url: `${siteUrl}/${locale}`, changeFrequency: "weekly", priority: 1 });
    for (const category of categories) {
      entries.push({ url: `${siteUrl}/${locale}/categories/${category.slug}`, changeFrequency: "weekly", priority: 0.7 });
    }
    for (const product of products) {
      entries.push({ url: `${siteUrl}/${locale}/products/${product.slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }

  return entries;
}
