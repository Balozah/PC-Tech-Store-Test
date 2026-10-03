"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import type { Database } from "@/lib/database.types";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await updateSettings(formData);
          setStatus(result?.error ? "error" : "saved");
        });
      }}
      className="max-w-xl space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">اسم المتجر بالعربي</label>
          <input name="business_name_ar" defaultValue={settings.business_name_ar} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Store name (English)</label>
          <input name="business_name_en" defaultValue={settings.business_name_en ?? ""} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">رقم الواتساب (دولي، أرقام فقط)</label>
        <input name="whatsapp" defaultValue={settings.whatsapp ?? ""} placeholder="963912345678" className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">العنوان بالعربي</label>
          <input name="address_ar" defaultValue={settings.address_ar ?? ""} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Address (English)</label>
          <input name="address_en" defaultValue={settings.address_en ?? ""} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">رابط خرائط Google</label>
        <input name="maps_url" defaultValue={settings.maps_url ?? ""} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">رابط embed للخريطة</label>
        <input name="maps_embed_url" defaultValue={settings.maps_embed_url ?? ""} className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">ساعات الدوام (JSON)</label>
        <textarea
          name="hours"
          defaultValue={JSON.stringify(settings.hours ?? [], null, 2)}
          rows={4}
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 font-mono text-xs"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">روابط السوشال (JSON)</label>
        <textarea
          name="socials"
          defaultValue={JSON.stringify(settings.socials ?? {}, null, 2)}
          rows={3}
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 font-mono text-xs"
        />
      </div>

      <button type="submit" disabled={isPending} className="cursor-pointer rounded-full bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        حفظ الإعدادات
      </button>
      {status === "saved" && <p className="text-sm text-[var(--color-success)]">تم الحفظ</p>}
      {status === "error" && <p className="text-sm text-[var(--color-destructive)]">صار خطأ، تأكد من صيغة JSON</p>}
    </form>
  );
}
