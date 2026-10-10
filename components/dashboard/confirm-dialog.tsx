"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Icon, buttonClass } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

type Request = { message: string; confirmLabel?: string; notice?: boolean };

// Styled replacement for window.confirm/alert. Uses the native <dialog> for
// focus trapping, Esc to cancel and the backdrop, so it needs no library.
//   const [ask, dialog] = useConfirm();
//   if (!(await ask({ message: "حذف؟", confirmLabel: "حذف" }))) return;
//   await ask({ message: result.error, notice: true }); // error notice, one button
//   ...render {dialog} once in the component.
export function useConfirm() {
  const ref = useRef<HTMLDialogElement>(null);
  // Every row renders its own dialog, so the label id must be unique per instance.
  const messageId = useId();
  const resolveRef = useRef<((ok: boolean) => void) | null>(null);
  const [request, setRequest] = useState<Request | null>(null);

  const ask = useCallback((req: Request) => {
    setRequest(req);
    // Opening waits for the state update so the dialog shows the new message.
    requestAnimationFrame(() => ref.current?.showModal());
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = (ok: boolean) => {
    ref.current?.close();
    resolveRef.current?.(ok);
    resolveRef.current = null;
  };

  const dialog = (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) close(false);
      }}
      aria-labelledby={messageId}
      className="m-auto w-[min(26rem,calc(100%-2rem))] border border-[var(--color-border)] bg-[var(--color-card)] p-0 text-[var(--color-foreground)] backdrop:bg-[rgb(14_14_16/0.5)]"
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center",
              request?.notice ? "bg-[var(--color-muted)]" : "bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]"
            )}
          >
            <Icon name="alert" className="h-5 w-5" />
          </span>
          <p id={messageId} className="whitespace-pre-line pt-2 text-sm leading-relaxed">
            {request?.message}
          </p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          {request?.notice ? (
            <button type="button" autoFocus onClick={() => close(true)} className={buttonClass.primary}>
              تمام
            </button>
          ) : (
            <>
              <button type="button" autoFocus onClick={() => close(false)} className={buttonClass.secondary}>
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={cn(buttonClass.primary, "bg-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/90")}
              >
                {request?.confirmLabel ?? "تأكيد"}
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  );

  return [ask, dialog] as const;
}
