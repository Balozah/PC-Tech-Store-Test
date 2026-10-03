"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import type { Database } from "@/lib/database.types";
import { DAYS, SOCIAL_PLATFORMS, type Day, type Hours } from "@/lib/site-settings";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

const DAY_LABELS: Record<Day, string> = {
  sat: "السبت",
  sun: "الأحد",
  mon: "الاثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
  fri: "الجمعة",
};

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2.5 text-base sm:text-sm";

function initialHours(saved: unknown): Hours[] {
  const list = Array.isArray(saved) ? (saved as Hours[]) : [];
  return DAYS.map(
    (day) => list.find((h) => h.day === day) ?? { day, open: "09:00", close: "21:00", closed: day === "fri" }
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "idle" | "saved" | "error"; message?: string }>({ type: "idle" });

  const savedHours = Array.isArray(settings.hours) ? settings.hours : [];
  const [showHours, setShowHours] = useState(savedHours.length > 0);
  const [hours, setHours] = useState<Hours[]>(initialHours(savedHours));
  const savedSocials = (settings.socials ?? {}) as Record<string, string>;
  const [socials, setSocials] = useState<Record<string, string>>(savedSocials);

  function updateDay(day: Day, patch: Partial<Hours>) {
    setHours((list) => list.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  }

  const cleanSocials = Object.fromEntries(
    Object.entries(socials).filter(([, url]) => url.trim()).map(([k, url]) => [k, url.trim()])
  );

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await updateSettings(formData);
          setStatus(result?.error ? { type: "error", message: result.error } : { type: "saved" });
        });
      }}
      className="max-w-2xl space-y-8"
    >
      <input type="hidden" name="hours" value={JSON.stringify(showHours ? hours : [])} />
      <input type="hidden" name="socials" value={JSON.stringify(cleanSocials)} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">معلومات المتجر</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">اسم المتجر بالعربي</label>
            <input name="business_name_ar" defaultValue={settings.business_name_ar} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Store name (English)</label>
            <input name="business_name_en" defaultValue={settings.business_name_en ?? ""} dir="ltr" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">رقم الواتساب</label>
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            dir="ltr"
            defaultValue={settings.whatsapp ?? ""}
            placeholder="963912345678"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            مع رمز الدولة وبدون صفر بالأول. عليه بتوصل كل الطلبات، وإذا تركته فاضي بيتسكّر زر الطلب.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">العنوان والخريطة</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">العنوان بالعربي</label>
            <input name="address_ar" defaultValue={settings.address_ar ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Address (English)</label>
            <input name="address_en" defaultValue={settings.address_en ?? ""} dir="ltr" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">رابط المحل على Google Maps</label>
          <input name="maps_url" type="url" dir="ltr" defaultValue={settings.maps_url ?? ""} placeholder="https://maps.app.goo.gl/..." className={inputClass} />
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">من Google Maps: مشاركة ← نسخ الرابط.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">رابط تضمين الخريطة (اختياري)</label>
          <input name="maps_embed_url" type="url" dir="ltr" defaultValue={settings.maps_embed_url ?? ""} placeholder="https://www.google.com/maps/embed?pb=..." className={inputClass} />
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            من Google Maps: مشاركة ← تضمين خريطة ← انسخ الرابط يلي جوا src=&quot;...&quot; بس.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">ساعات الدوام</h2>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={showHours} onChange={(e) => setShowHours(e.target.checked)} className="h-4 w-4" />
            اعرضها بالموقع
          </label>
        </div>
        {showHours && (
          <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
            {hours.map((h) => (
              <div key={h.day} className="flex flex-wrap items-center gap-3 p-3">
                <span className="w-20 text-sm font-medium">{DAY_LABELS[h.day]}</span>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={h.closed} onChange={(e) => updateDay(h.day, { closed: e.target.checked })} className="h-4 w-4" />
                  مسكّر
                </label>
                {!h.closed && (
                  <div className="flex items-center gap-2" dir="ltr">
                    <input type="time" value={h.open} onChange={(e) => updateDay(h.day, { open: e.target.value })} className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm" />
                    <span>-</span>
                    <input type="time" value={h.close} onChange={(e) => updateDay(h.day, { close: e.target.value })} className="rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">السوشال ميديا</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">حط الرابط الكامل. يلي بتتركه فاضي ما بيظهر بالموقع.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_PLATFORMS.map((p) => (
            <div key={p.key}>
              <label className="mb-1 block text-sm font-medium">{p.label}</label>
              <input
                type="url"
                dir="ltr"
                value={socials[p.key] ?? ""}
                onChange={(e) => setSocials((s) => ({ ...s, [p.key]: e.target.value }))}
                placeholder="https://"
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 cursor-pointer rounded-full bg-[var(--color-primary)] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
        {status.type === "saved" && <p className="text-sm text-[var(--color-success)]">تم الحفظ</p>}
        {status.type === "error" && <p className="text-sm text-[var(--color-destructive)]">{status.message}</p>}
      </div>
    </form>
  );
}
