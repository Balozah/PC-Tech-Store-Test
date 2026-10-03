"use server";

import { revalidateEverything } from "@/lib/revalidate";
import { requireAdmin, NOT_AUTHORIZED } from "@/lib/supabase/admin";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type OptionGroupInput = {
  id?: string;
  name_ar: string;
  name_en: string | null;
  kind: "text" | "color";
  is_required: boolean;
  values: {
    id?: string;
    label_ar: string;
    label_en: string | null;
    hex: string | null;
    price_override_usd: number | null;
    price_override_syp: number | null;
    is_available: boolean;
  }[];
};

export type ProductFormInput = {
  category_id: string | null;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  price_usd: number | null;
  price_syp: number | null;
  price_on_request: boolean;
  is_available: boolean;
  slug?: string;
  optionGroups: OptionGroupInput[];
};

export async function saveProduct(productId: string | null, input: ProductFormInput) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };

  if (!input.name_ar.trim()) return { error: "اسم المنتج بالعربي مطلوب" };
  if (!input.price_on_request && (input.price_usd == null || input.price_syp == null)) {
    return { error: "أدخل السعر بالعملتين أو فعّل \"السعر عند الطلب\"" };
  }

  const slug = input.slug?.trim() || slugify(input.name_en ?? input.name_ar) + "-" + Date.now().toString(36);

  const payload = {
    category_id: input.category_id,
    name_ar: input.name_ar,
    name_en: input.name_en,
    description_ar: input.description_ar,
    description_en: input.description_en,
    price_usd: input.price_on_request ? null : input.price_usd,
    price_syp: input.price_on_request ? null : input.price_syp,
    price_on_request: input.price_on_request,
    is_available: input.is_available,
  };

  let id = productId;

  if (id) {
    const { error } = await supabase
      .from("products")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, slug })
      .select("id")
      .single();
    if (error) return { error: error.message };
    id = data.id;
  }

  // Replace option groups/values wholesale — simplest consistent approach for a small catalog.
  const groups = input.optionGroups
    .map((g) => ({ ...g, name_ar: g.name_ar.trim(), values: g.values.filter((v) => v.label_ar.trim()) }))
    .filter((g) => g.name_ar && g.values.length);

  await supabase.from("option_groups").delete().eq("product_id", id);
  if (groups.length) {
    const { data: groupRows, error: groupError } = await supabase
      .from("option_groups")
      .insert(
        groups.map((g, gi) => ({
          product_id: id,
          name_ar: g.name_ar,
          name_en: g.name_en?.trim() || null,
          kind: g.kind,
          is_required: g.is_required,
          sort_order: gi,
        }))
      )
      .select("id, sort_order");
    if (groupError) return { error: groupError.message };

    const groupIdByOrder = new Map(groupRows.map((r) => [r.sort_order, r.id]));
    const { error: valuesError } = await supabase.from("option_values").insert(
      groups.flatMap((g, gi) =>
        g.values.map((v, vi) => ({
          group_id: groupIdByOrder.get(gi)!,
          label_ar: v.label_ar.trim(),
          label_en: v.label_en?.trim() || null,
          hex: g.kind === "color" ? v.hex : null,
          price_override_usd: v.price_override_usd,
          price_override_syp: v.price_override_syp,
          is_available: v.is_available,
          sort_order: vi,
        }))
      )
    );
    if (valuesError) return { error: valuesError.message };
  }

  revalidateEverything();
  return { ok: true, id, slug };
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };

  const { data: images } = await supabase.from("product_images").select("path").eq("product_id", id);
  const storagePaths = (images ?? []).map((i) => i.path).filter((p) => !p.startsWith("http"));
  if (storagePaths.length) {
    await supabase.storage.from("products").remove(storagePaths);
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateEverything();
  return { ok: true };
}

export async function addProductImages(productId: string, paths: string[]) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };
  if (!paths.length) return { ok: true };

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  const start = count ?? 0;

  const { error } = await supabase
    .from("product_images")
    .insert(paths.map((path, i) => ({ product_id: productId, path, sort_order: start + i })));
  if (error) return { error: error.message };
  revalidateEverything();
  return { ok: true };
}

export async function reorderProductImages(productId: string, orderedIds: string[]) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", id).eq("product_id", productId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidateEverything();
  return { ok: true };
}

export async function deleteProductImage(imageId: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };

  // Look the path up server-side rather than trusting a client-supplied storage path.
  const { data: image } = await supabase.from("product_images").select("path").eq("id", imageId).maybeSingle();
  if (!image) return { error: "الصورة مش موجودة" };
  if (!image.path.startsWith("http")) {
    await supabase.storage.from("products").remove([image.path]);
  }
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { error: error.message };
  revalidateEverything();
  return { ok: true };
}
