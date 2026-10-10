"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import type { Database } from "@/lib/database.types";
import { DAYS, SOCIAL_PLATFORMS, type Day, type Hours } from "@/lib/site-settings";
import { Card, Icon, Spinner, Switch, buttonClass, hintClass, inputClass, labelClass } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

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
      className="space-y-4 pb-24"
    >
      <input type="hidden" name="hours" value={JSON.stringify(showHours ? hours : [])} />
      <input type="hidden" name="socials" value={JSON.stringify(cleanSocials)} />

      <Card title="معلومات المتجر">
        <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>اسم المتجر بالعربي</label>
            <input name="business_name_ar" defaultValue={settings.business_name_ar} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Store name (English)</label>
            <input name="business_name_en" defaultValue={settings.business_name_en ?? ""} dir="ltr" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>رقم الواتساب</label>
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            dir="ltr"
            defaultValue={settings.whatsapp ?? ""}
            placeholder="963912345678"
            className={inputClass}
          />
          <p className={hintClass}>
            مع رمز الدولة وبدون صفر بالأول. عليه بتوصل كل الطلبات، وإذا تركته فاضي بيتسكّر زر الطلب.
          </p>
        </div>
        </div>
      </Card>

      <Card title="العنوان والخريطة">
        <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>العنوان بالعربي</label>
            <input name="address_ar" defaultValue={settings.address_ar ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Address (English)</label>
            <input name="address_en" defaultValue={settings.address_en ?? ""} dir="ltr" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>رابط المحل على Google Maps</label>
          <input name="maps_url" type="url" dir="ltr" defaultValue={settings.maps_url ?? ""} placeholder="https://maps.app.goo.gl/..." className={inputClass} />
          <p className={hintClass}>من Google Maps: مشاركة ← نسخ الرابط.</p>
        </div>
        <div>
          <label className={labelClass}>رابط تضمين الخريطة (اختياري)</label>
          <input name="maps_embed_url" type="url" dir="ltr" defaultValue={settings.maps_embed_url ?? ""} placeholder="https://www.google.com/maps/embed?pb=..." className={inputClass} />
          <p className={hintClass}>
            من Google Maps: مشاركة ← تضمين خريطة ← انسخ الرابط يلي جوا src=&quot;...&quot; بس.
          </p>
        </div>
        </div>
      </Card>

      <Card title="ساعات الدوام">
        <Switch checked={showHours} onChange={setShowHours} label="اعرض ساعات الدوام بالموقع" />
        {showHours && (
          <div className="mt-3 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-background)]">
            {hours.map((h) => (
              <div key={h.day} className="flex min-h-14 flex-wrap items-center gap-3 px-3 py-2">
                <span className="w-20 text-sm font-medium">{DAY_LABELS[h.day]}</span>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={h.closed} onChange={(e) => updateDay(h.day, { closed: e.target.checked })} className="h-4 w-4" />
                  مسكّر
                </label>
                {!h.closed && (
                  <div className="flex items-center gap-2" dir="ltr">
                    <input type="time" value={h.open} onChange={(e) => updateDay(h.day, { open: e.target.value })} className="min-h-11 border border-[var(--color-border)] bg-[var(--color-card)] px-2 text-sm" />
                    <span>-</span>
                    <input type="time" value={h.close} onChange={(e) => updateDay(h.day, { close: e.target.value })} className="min-h-11 border border-[var(--color-border)] bg-[var(--color-card)] px-2 text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="السوشال ميديا" description="حط الرابط الكامل. يلي بتتركه فاضي ما بيظهر بالموقع.">
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_PLATFORMS.map((p) => (
            <div key={p.key}>
              <label className={labelClass}>{p.label}</label>
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
      </Card>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-md md:bottom-0 md:start-64">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 md:px-8">
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={cn("min-w-0 flex-1 truncate text-sm", status.type === "error" ? "text-[var(--color-destructive)]" : "text-[var(--color-success)]")}
          >
            {status.type !== "idle" && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name={status.type === "error" ? "alert" : "check"} className="h-4 w-4" />
                {status.type === "saved" ? "انحفظت الإعدادات وطلعت عالموقع." : status.message}
              </span>
            )}
          </p>
          <button type="submit" disabled={isPending} className={cn(buttonClass.primary, "min-w-32")}>
            {isPending ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </form>
  );
}
