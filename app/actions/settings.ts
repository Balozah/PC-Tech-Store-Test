"use server";

import { revalidateEverything } from "@/lib/revalidate";
import { requireAdmin, NOT_AUTHORIZED } from "@/lib/supabase/admin";
import { DAYS, SOCIAL_PLATFORMS } from "@/lib/site-settings";

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function optionalUrl(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return { value: null };
  return isHttpsUrl(value) ? { value } : { error: true };
}

export async function updateSettings(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) return { error: NOT_AUTHORIZED };

  let hours: unknown;
  let socials: unknown;
  try {
    hours = JSON.parse(String(formData.get("hours") ?? "[]"));
  } catch {
    return { error: "صيغة ساعات الدوام غير صحيحة" };
  }
  try {
    socials = JSON.parse(String(formData.get("socials") ?? "{}"));
  } catch {
    return { error: "صيغة روابط السوشال غير صحيحة" };
  }

  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    !Array.isArray(hours) ||
    !hours.every(
      (h) =>
        h &&
        DAYS.includes(h.day) &&
        typeof h.closed === "boolean" &&
        (h.closed || (time.test(h.open) && time.test(h.close)))
    )
  ) {
    return { error: "ساعات الدوام غير صحيحة" };
  }

  const platformKeys: string[] = SOCIAL_PLATFORMS.map((p) => p.key);
  if (
    !socials ||
    typeof socials !== "object" ||
    Array.isArray(socials) ||
    !Object.entries(socials).every(([k, v]) => platformKeys.includes(k) && isHttpsUrl(v))
  ) {
    return { error: "روابط السوشال لازم تكون روابط كاملة تبدأ بـ https://" };
  }

  const mapsUrl = optionalUrl(formData, "maps_url");
  const mapsEmbed = optionalUrl(formData, "maps_embed_url");
  if (mapsUrl.error || mapsEmbed.error) {
    return { error: "روابط الخريطة لازم تبدأ بـ https://" };
  }
  if (mapsEmbed.value) {
    const embed = new URL(mapsEmbed.value);
    if (!["www.google.com", "google.com"].includes(embed.hostname) || !embed.pathname.startsWith("/maps/embed")) {
      return { error: "رابط تضمين الخريطة لازم يكون من Google Maps (يبدأ بـ https://www.google.com/maps/embed)" };
    }
  }

  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/[^\d+]/g, "") || null;

  const payload = {
    id: 1,
    business_name_ar: String(formData.get("business_name_ar") ?? "").trim() || "Tech RT",
    business_name_en: String(formData.get("business_name_en") ?? "").trim() || null,
    whatsapp,
    address_ar: String(formData.get("address_ar") ?? "").trim() || null,
    address_en: String(formData.get("address_en") ?? "").trim() || null,
    maps_url: mapsUrl.value,
    maps_embed_url: mapsEmbed.value,
    hours: hours as never,
    socials: socials as never,
  };

  const { error } = await supabase.from("site_settings").upsert(payload);
  if (error) return { error: error.message };

  revalidateEverything();
  return { ok: true };
}
