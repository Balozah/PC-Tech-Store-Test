"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  // Honeypot: real users never fill this hidden field.
  if (formData.get("company")) {
    return { ok: true }; // silently drop bot submissions, no error leaked
  }

  const productId = String(formData.get("productId") ?? "");
  const authorName = String(formData.get("authorName") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!productId || authorName.length < 2 || authorName.length > 60) {
    return { ok: false, error: "invalid" };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "invalid" };
  }
  if (comment.length > 1000) {
    return { ok: false, error: "invalid" };
  }

  if (!isSupabaseConfigured()) {
    // Demo mode: no database to write to yet.
    return { ok: false, error: "not_configured" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    author_name: authorName,
    rating,
    comment: comment || null,
    status: "pending",
  });

  // Throttling lives in a DB trigger (supabase/schema.sql) so it also covers direct API inserts.
  if (error) return { ok: false, error: error.message.includes("rate_limited") ? "rate_limited" : "server" };
  return { ok: true };
}
