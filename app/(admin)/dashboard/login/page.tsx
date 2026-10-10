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
      <div className="w-full max-w-sm border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center">
        <h1 className="mb-2 text-lg font-bold">Supabase غير مربوط بعد</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">أضف متغيرات البيئة الخاصة بـ Supabase قبل تسجيل الدخول.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 border-b border-[var(--color-border)] pb-5">
        <h1 className="font-display text-[clamp(1.75rem,4vw,2.25rem)]">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">سجّل دخول لتدير منتجات المتجر</p>
      </div>

      <form action={formAction} className="space-y-4 border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
        <div>
          <label htmlFor="email" className={labelClass}>البريد الإلكتروني</label>
          <input id="email" name="email" type="email" dir="ltr" autoComplete="email" required defaultValue={state?.email} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>كلمة المرور</label>
          <input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required className={inputClass} />
        </div>
        {state?.error && (
          <p role="alert" className="flex items-center gap-1.5 border border-[var(--color-destructive)] px-3 py-2.5 text-sm font-medium text-[var(--color-destructive)]">
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
