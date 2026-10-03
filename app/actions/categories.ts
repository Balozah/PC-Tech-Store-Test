"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim() || null;
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name_en ?? name_ar);

  if (!name_ar) return { error: "اسم القسم بالعربي مطلوب" };

  const { data: maxRow } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const { error } = await supabase.from("categories").insert({
    name_ar,
    name_en,
    slug,
    sort_order: (maxRow?.sort_order ?? 0) + 1,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const name_ar = String(formData.get("name_ar") ?? "").trim();
  const name_en = String(formData.get("name_en") ?? "").trim() || null;
  const slug = String(formData.get("slug") ?? "").trim();

  if (!name_ar || !slug) return { error: "الاسم والرابط مطلوبان" };

  const { error } = await supabase.from("categories").update({ name_ar, name_en, slug }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}

export async function reorderCategory(id: string, sort_order: number) {
  const supabase = await createClient();
  await supabase.from("categories").update({ sort_order }).eq("id", id);
  revalidatePath("/dashboard/categories");
  revalidatePath("/[locale]", "layout");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/categories");
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}
