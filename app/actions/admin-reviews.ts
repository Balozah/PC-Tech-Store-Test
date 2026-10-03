"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, NOT_AUTHORIZED } from "@/lib/supabase/admin";

export async function approveReview(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };
  const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reviews");
  revalidatePath("/[locale]/products/[slug]", "page");
  return { ok: true };
}

export async function deleteReview(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reviews");
  revalidatePath("/[locale]/products/[slug]", "page");
  return { ok: true };
}
