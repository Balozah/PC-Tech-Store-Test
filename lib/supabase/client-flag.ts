// NEXT_PUBLIC_* vars are inlined at build time, so this is safe to call from
// client components without shipping any secret.
export function isSupabaseConfiguredClient() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
