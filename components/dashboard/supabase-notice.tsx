export function SupabaseNotice() {
  return (
    <div className="mb-6 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent)]/10 p-4 text-sm">
      <p className="font-semibold text-[var(--color-accent)]">Supabase غير مربوط بعد</p>
      <p className="mt-1 text-[var(--color-muted-foreground)]">
        الموقع العام يعرض حالياً بيانات تجريبية ثابتة (lib/placeholder-data.ts). لتفعيل لوحة التحكم
        فعلياً: أنشئ مشروع Supabase، نفّذ supabase/schema.sql ثم supabase/seed.sql، وأضف
        NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY إلى .env.local — راجع README.md.
      </p>
    </div>
  );
}
