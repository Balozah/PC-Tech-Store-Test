"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { isSupabaseConfiguredClient } from "@/lib/supabase/client-flag";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, undefined);

  if (!isSupabaseConfiguredClient()) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] p-6 text-center">
        <h1 className="mb-2 text-lg font-bold">Supabase غير مربوط بعد</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          أضف متغيرات البيئة الخاصة بـ Supabase قبل تسجيل الدخول للوحة التحكم.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--color-border)] p-6"
    >
      <h1 className="text-lg font-bold">تسجيل دخول صاحب المتجر</h1>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-[var(--color-destructive)]">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full cursor-pointer rounded-full bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        دخول
      </button>
    </form>
  );
}
