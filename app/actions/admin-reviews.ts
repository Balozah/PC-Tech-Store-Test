"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reviews");
  revalidatePath("/[locale]/products/[slug]", "page");
  return { ok: true };
}

export async function deleteReview(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/reviews");
  revalidatePath("/[locale]/products/[slug]", "page");
  return { ok: true };
}
