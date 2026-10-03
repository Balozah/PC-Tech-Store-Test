import { createClient } from "@/lib/supabase/server";

export const NOT_AUTHORIZED = "غير مصرح لك بهذا الإجراء";

// Server actions are public POST endpoints, so each admin action re-checks here
// instead of trusting that the proxy redirect ran.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return data ? supabase : null;
}
