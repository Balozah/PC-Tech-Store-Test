import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { PageHeader } from "@/components/dashboard/ui";
import { isSupabaseConfigured, getSiteSettings } from "@/lib/data";

export const metadata = { title: "إعدادات الموقع" };

export default async function SettingsPage() {
  const configured = isSupabaseConfigured();
  const settings = await getSiteSettings();

  return (
    <div>
      <PageHeader title="إعدادات الموقع" description="معلومات التواصل يلي بتبيّن للزبون. يلي بتتركه فاضي ما بيظهر." />
      {!configured && <SupabaseNotice />}
      <SettingsForm settings={settings} />
    </div>
  );
}
