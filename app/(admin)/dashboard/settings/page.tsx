import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { isSupabaseConfigured, getSiteSettings } from "@/lib/data";

export default async function SettingsPage() {
  const configured = isSupabaseConfigured();
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إعدادات الموقع</h1>
      {!configured && <SupabaseNotice />}
      <SettingsForm settings={settings} />
    </div>
  );
}
