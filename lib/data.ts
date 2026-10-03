import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import * as placeholder from "@/lib/placeholder-data";
import type { Database } from "@/lib/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type OptionGroup = Database["public"]["Tables"]["option_groups"]["Row"];
export type OptionValue = Database["public"]["Tables"]["option_values"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type ProductWithRelations = Product & {
  images: ProductImage[];
  optionGroups: (OptionGroup & { values: OptionValue[] })[];
  category: Category | null;
  reviews: Review[];
};

export { isSupabaseConfigured };

export async function getSiteSettings() {
  if (!isSupabaseConfigured()) return placeholder.siteSettings;
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return data ?? placeholder.siteSettings;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return [...placeholder.categories].sort((a, b) => a.sort_order - b.sort_order);
  }
  const supabase = createPublicClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let list = [...placeholder.products];
    if (categorySlug) {
      const cat = placeholder.categories.find((c) => c.slug === categorySlug);
      list = list.filter((p) => p.category_id === cat?.id);
    }
    return list.sort((a, b) => a.sort_order - b.sort_order);
  }
  const supabase = createPublicClient();
  let query = supabase.from("products").select("*").order("sort_order");
  if (categorySlug) {
    const cat = await getCategoryBySlug(categorySlug);
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) {
    const product = placeholder.products.find((p) => p.slug === slug);
    if (!product) return null;
    const images = placeholder.productImages[slug] ?? [];
    const groups = placeholder.optionGroups[slug] ?? [];
    const optionGroups = groups.map((g) => ({
      ...g,
      values: placeholder.optionValues[g.id] ?? [],
    }));
    const category = placeholder.categories.find((c) => c.id === product.category_id) ?? null;
    return { ...product, images, optionGroups, category, reviews: [] };
  }

  const supabase = createPublicClient();
  const { data: product } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (!product) return null;

  const [{ data: images }, { data: groups }, { data: category }, { data: reviews }] = await Promise.all([
    supabase.from("product_images").select("*").eq("product_id", product.id).order("sort_order"),
    supabase.from("option_groups").select("*").eq("product_id", product.id).order("sort_order"),
    product.category_id
      ? supabase.from("categories").select("*").eq("id", product.category_id).single()
      : Promise.resolve({ data: null }),
    supabase.from("reviews").select("*").eq("product_id", product.id).eq("status", "approved").order("created_at", { ascending: false }),
  ]);

  const groupIds = (groups ?? []).map((g) => g.id);
  const { data: values } = groupIds.length
    ? await supabase.from("option_values").select("*").in("group_id", groupIds).order("sort_order")
    : { data: [] };

  const optionGroups = (groups ?? []).map((g) => ({
    ...g,
    values: (values ?? []).filter((v) => v.group_id === g.id),
  }));

  return {
    ...product,
    images: images ?? [],
    optionGroups,
    category: category ?? null,
    reviews: reviews ?? [],
  };
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) {
    const product = placeholder.products.find((p) => p.id === id);
    return product ? getProductBySlug(product.slug) : null;
  }
  const supabase = createPublicClient();
  const { data } = await supabase.from("products").select("slug").eq("id", id).single();
  return data ? getProductBySlug(data.slug) : null;
}

export type CardExtras = { image?: ProductImage; rating: { average: number; count: number } };

// Cover image + rating for a list of cards in two queries instead of one per product.
export async function getCardExtras(products: Product[]): Promise<Record<string, CardExtras>> {
  const empty = { average: 0, count: 0 };
  if (!products.length) return {};

  if (!isSupabaseConfigured()) {
    return Object.fromEntries(
      products.map((p) => [p.slug, { image: placeholder.productImages[p.slug]?.[0], rating: empty }])
    );
  }

  const supabase = createPublicClient();
  const ids = products.map((p) => p.id);
  const [{ data: images }, { data: reviews }] = await Promise.all([
    supabase.from("product_images").select("*").in("product_id", ids).order("sort_order"),
    supabase.from("reviews").select("product_id, rating").in("product_id", ids).eq("status", "approved"),
  ]);

  return Object.fromEntries(
    products.map((p) => {
      const ratings = (reviews ?? []).filter((r) => r.product_id === p.id) as Review[];
      return [p.slug, { image: (images ?? []).find((i) => i.product_id === p.id), rating: getProductRating(ratings) }];
    })
  );
}

export { productImageUrl } from "@/lib/product-image";

export function getProductRating(reviews: Review[]) {
  if (!reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
