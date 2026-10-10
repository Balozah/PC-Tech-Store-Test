import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/lib/data";

// These read with the signed-in session: RLS only exposes pending reviews to admins.

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

/** Published reviews, newest first, so the owner can still remove one later. */
export async function getApprovedReviews(limit = 50): Promise<(Review & { product_name: string })[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, products(name_ar)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((r) => {
    const row = r as Review & { products: { name_ar: string } | null };
    return { ...row, product_name: row.products?.name_ar ?? "" };
  });
}

export async function getPendingReviewCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
