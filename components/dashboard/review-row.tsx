"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveReview, deleteReview } from "@/app/actions/admin-reviews";
import { StarRating } from "@/components/star-rating";

export function ReviewRow({
  review,
}: {
  review: { id: string; author_name: string; rating: number; comment: string | null; product_name: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold">{review.author_name}</span>
          <span className="ms-2 text-xs text-[var(--color-muted-foreground)]">— {review.product_name}</span>
        </div>
        <StarRating value={review.rating} />
      </div>
      {review.comment && <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{review.comment}</p>}
      <div className="mt-3 flex gap-3">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await approveReview(review.id);
              if (result?.error) alert(result.error);
              router.refresh();
            })
          }
          className="cursor-pointer rounded-full bg-[var(--color-success)] px-3 py-1 text-xs font-semibold text-black"
        >
          موافقة
        </button>
        <button
          disabled={isPending}
          onClick={() => {
            if (!confirm("حذف هالتقييم؟")) return;
            startTransition(async () => {
              const result = await deleteReview(review.id);
              if (result?.error) alert(result.error);
              router.refresh();
            });
          }}
          className="cursor-pointer rounded-full bg-[var(--color-destructive)] px-3 py-1 text-xs font-semibold text-white"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
