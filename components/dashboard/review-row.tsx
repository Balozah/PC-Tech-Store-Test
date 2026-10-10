"use client";

import { useState, useTransition } from "react";
import { approveReview, deleteReview } from "@/app/actions/admin-reviews";
import { StarRating } from "@/components/star-rating";
import { Icon, Spinner, buttonClass } from "@/components/dashboard/ui";
import { useConfirm } from "@/components/dashboard/confirm-dialog";

export function ReviewRow({
  review,
  approved = false,
}: {
  review: { id: string; author_name: string; rating: number; comment: string | null; product_name: string; created_at: string | null };
  /** Already published: only removal is offered. */
  approved?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "delete" | null>(null);
  const [ask, dialog] = useConfirm();

  const run = async (kind: "approve" | "delete") => {
    if (kind === "delete") {
      const message = approved ? "حذف هالتقييم من الموقع نهائياً؟" : "حذف هالتقييم؟";
      if (!(await ask({ message, confirmLabel: "حذف" }))) return;
    }
    setAction(kind);
    startTransition(async () => {
      const result = kind === "approve" ? await approveReview(review.id) : await deleteReview(review.id);
      if (result?.error) await ask({ message: result.error, notice: true });
      setAction(null);
    });
  };

  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString("ar", { day: "numeric", month: "long", timeZone: "Asia/Damascus" })
    : null;

  return (
    <article className=" border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{review.author_name}</p>
          <p className="truncate text-xs text-[var(--color-muted-foreground)]">
            على {review.product_name}
            {date && ` · ${date}`}
          </p>
        </div>
        <StarRating value={review.rating} />
      </div>
      {review.comment && <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>}
      <div className={approved ? "mt-4 flex" : "mt-4 grid grid-cols-2 gap-2 sm:flex"}>
        {!approved && (
          <button type="button" disabled={isPending} onClick={() => run("approve")} className={buttonClass.success}>
            {action === "approve" ? <Spinner /> : <Icon name="check" className="h-4 w-4" />}
            موافقة ونشر
          </button>
        )}
        <button type="button" disabled={isPending} onClick={() => run("delete")} className={buttonClass.danger}>
          {action === "delete" ? <Spinner /> : <Icon name="trash" className="h-4 w-4" />}
          حذف
        </button>
      </div>
      {dialog}
    </article>
  );
}
