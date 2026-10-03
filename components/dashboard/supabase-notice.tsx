import { Icon } from "@/components/dashboard/ui";

export function SupabaseNotice() {
  return (
    <div className="mb-6 flex gap-3 rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 p-4 text-sm">
      <Icon name="alert" className="mt-0.5 text-[var(--color-accent)]" />
      <div>
        <p className="font-semibold text-[var(--color-accent)]">قاعدة البيانات مش موصولة</p>
        <p className="mt-1 text-[var(--color-muted-foreground)]">
          الموقع عم يعرض بيانات تجريبية. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY لتشتغل لوحة التحكم.
        </p>
      </div>
    </div>
  );
}
