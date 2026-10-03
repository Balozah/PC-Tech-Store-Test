"use server";

import { headers } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

// Simple in-memory rate limit (per server instance): 1 review per IP per 60s.
// Good enough to blunt casual spam; not a substitute for a real queue/WAF.
const lastSubmission = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  // Honeypot: real users never fill this hidden field.
  if (formData.get("company")) {
    return { ok: true }; // silently drop bot submissions, no error leaked
  }

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
  const last = lastSubmission.get(ip);
  if (last && Date.now() - last < RATE_LIMIT_MS) {
    return { ok: false, error: "rate_limited" };
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

  if (error) return { ok: false, error: "server" };
  lastSubmission.set(ip, Date.now());
  return { ok: true };
}
