"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const INVALID_LOGIN = "بيانات الدخول غير صحيحة";
const RATE_LIMITED = "محاولات كثيرة، جرّب بعد بضع دقائق";
const AUTH_UNREACHABLE = "تعذّر الاتصال بخادم تسجيل الدخول، جرّب مرة أخرى";

export async function signIn(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: INVALID_LOGIN };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    console.error("signIn failed", { code: error?.code, status: error?.status, name: error?.name, message: error?.message });
    if (error?.status === 429 || error?.code === "over_request_rate_limit") return { error: RATE_LIMITED };
    if (error && !error.status) return { error: AUTH_UNREACHABLE };
    return { error: INVALID_LOGIN };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!admin) {
    console.error("signIn: user is not in admins", { userId: data.user.id, error: adminError?.message });
    await supabase.auth.signOut();
    return { error: INVALID_LOGIN };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/dashboard/login");
}
