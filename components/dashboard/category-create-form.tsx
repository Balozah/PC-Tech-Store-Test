"use client";

import { useRef, useState, useTransition } from "react";
import { createCategory } from "@/app/actions/categories";
import { Card, Icon, Spinner, buttonClass, hintClass, inputClass, labelClass } from "@/components/dashboard/ui";

export function CategoryCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "ok" | "error"; message: string } | null>(null);

  return (
    <Card title="قسم جديد" className="mb-5">
      <form
        ref={formRef}
        action={(formData) => {
          setStatus(null);
          startTransition(async () => {
            const result = await createCategory(formData);
            if (result?.error) {
              setStatus({ type: "error", message: result.error });
            } else {
              setStatus({ type: "ok", message: "انضاف القسم" });
              formRef.current?.reset();
            }
          });
        }}
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div>
          <label htmlFor="new_cat_ar" className={labelClass}>الاسم</label>
          <input id="new_cat_ar" name="name_ar" required placeholder="مثلاً: كروت شاشة" className={inputClass} />
        </div>
        <div>
          <label htmlFor="new_cat_en" className={labelClass}>Name (English)</label>
          <input id="new_cat_en" name="name_en" dir="ltr" placeholder="Graphics Cards" className={inputClass} />
        </div>
        <button type="submit" disabled={isPending} className={buttonClass.primary}>
          {isPending ? <Spinner /> : <Icon name="plus" className="h-4 w-4" />}
          إضافة
        </button>
      </form>
      {status ? (
        <p
          role={status.type === "error" ? "alert" : "status"}
          className={`mt-3 flex items-center gap-1.5 text-sm ${status.type === "error" ? "text-[var(--color-destructive)]" : "text-[var(--color-success)]"}`}
        >
          <Icon name={status.type === "error" ? "alert" : "check"} className="h-4 w-4" />
          {status.message}
        </p>
      ) : (
        <p className={hintClass}>رابط القسم بيتعمل تلقائياً من الاسم الإنكليزي.</p>
      )}
    </Card>
  );
}
