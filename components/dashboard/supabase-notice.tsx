import { Icon } from "@/components/dashboard/ui";

export function SupabaseNotice() {
  return (
    <div className="mb-6 flex gap-3 border border-[#b45309]/40 bg-[#b45309]/10 p-4 text-sm">
      <Icon name="alert" className="mt-0.5 text-[#92400e]" />
      <div>
        <p className="font-semibold text-[#92400e]">قاعدة البيانات مش موصولة</p>
        <p className="mt-1 text-[var(--color-muted-foreground)]">
          الموقع عم يعرض بيانات تجريبية. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY لتشتغل لوحة التحكم.
        </p>
      </div>
    </div>
  );
}
