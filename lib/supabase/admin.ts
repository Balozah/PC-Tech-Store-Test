import { createClient } from "@/lib/supabase/server";

export const NOT_AUTHORIZED = "غير مصرح لك بهذا الإجراء";

// Server actions are public POST endpoints, so each admin action re-checks here
// instead of trusting that the proxy redirect ran. getClaims verifies the session
// JWT locally (ES256 + cached JWKS), so only the admins lookup hits the database.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return data ? supabase : null;
}
