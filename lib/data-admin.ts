import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/lib/data";

export async function getPendingReviews(): Promise<(Review & { product_name: string })[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, products(name_ar)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => {
    const row = r as Review & { products: { name_ar: string } | null };
    return { ...row, product_name: row.products?.name_ar ?? "" };
  });
}
