import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Cookie-less anon client for public catalog reads, so pages can be statically
// generated at build time and served from cache. RLS still limits it to public rows.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
