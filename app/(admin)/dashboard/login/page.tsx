"use client";

import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";
import { isSupabaseConfiguredClient } from "@/lib/supabase/client-flag";
import { Icon, Spinner, buttonClass, inputClass, labelClass } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, undefined);

  if (!isSupabaseConfiguredClient()) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
        <h1 className="mb-2 text-lg font-bold">Supabase غير مربوط بعد</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">أضف متغيرات البيئة الخاصة بـ Supabase قبل تسجيل الدخول.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/30">
          <Icon name="box" className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">سجّل دخول لتدير منتجات المتجر</p>
      </div>

      <form action={formAction} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
        <div>
          <label htmlFor="email" className={labelClass}>البريد الإلكتروني</label>
          <input id="email" name="email" type="email" dir="ltr" autoComplete="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>كلمة المرور</label>
          <input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required className={inputClass} />
        </div>
        {state?.error && (
          <p role="alert" className="flex items-center gap-1.5 rounded-xl bg-[var(--color-destructive)]/10 px-3 py-2.5 text-sm text-[var(--color-destructive)]">
            <Icon name="alert" className="h-4 w-4" />
            {state.error}
          </p>
        )}
        <button type="submit" disabled={isPending} className={cn(buttonClass.primary, "w-full")}>
          {isPending && <Spinner />}
          {isPending ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
