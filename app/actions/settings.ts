"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const hoursRaw = String(formData.get("hours") ?? "[]");
  const socialsRaw = String(formData.get("socials") ?? "{}");

  let hours = [];
  let socials = {};
  try {
    hours = JSON.parse(hoursRaw);
  } catch {
    return { error: "صيغة ساعات الدوام غير صحيحة" };
  }
  try {
    socials = JSON.parse(socialsRaw);
  } catch {
    return { error: "صيغة روابط السوشال غير صحيحة" };
  }

  const payload = {
    id: 1,
    business_name_ar: String(formData.get("business_name_ar") ?? "Tech RT"),
    business_name_en: String(formData.get("business_name_en") ?? "") || null,
    whatsapp: String(formData.get("whatsapp") ?? "") || null,
    address_ar: String(formData.get("address_ar") ?? "") || null,
    address_en: String(formData.get("address_en") ?? "") || null,
    maps_url: String(formData.get("maps_url") ?? "") || null,
    maps_embed_url: String(formData.get("maps_embed_url") ?? "") || null,
    hours,
    socials,
  };

  const { error } = await supabase.from("site_settings").upsert(payload);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}
