"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitReview } from "@/app/actions/reviews";

export function ReviewForm({ productId }: { productId: string }) {
  const t = useTranslations("product");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "rate_limited">("idle");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await submitReview(formData);
          setStatus(result.ok ? "sent" : result.error === "rate_limited" ? "rate_limited" : "error");
        });
      }}
      className="relative space-y-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      {/* Honeypot — hidden from real users via CSS, not display:none, to stay in the tab order trap for simple bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]"
        aria-hidden="true"
      />
      <input type="hidden" name="productId" value={productId} />

      <h3 className="text-lg">{t("addReview")}</h3>

      <div>
        <label htmlFor="authorName" className="mb-1 block text-sm font-medium">
          {t("reviewName")}
        </label>
        <input
          id="authorName"
          name="authorName"
          required
          minLength={2}
          maxLength={60}
          className="min-h-11 w-full border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-ink)]"
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">{t("reviewRating")}</span>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1" role="radiogroup" aria-label={t("reviewRating")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} / 5`}
              onClick={() => setRating(n)}
              className="grid size-11 cursor-pointer place-items-center"
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 20 20"
                fill={n <= rating ? "var(--color-accent)" : "none"}
                stroke="var(--color-accent)"
                strokeWidth={1.5}
              >
                <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.78L10 14.9l-5.21 2.6 1-5.78-4.21-4.1 5.82-.85L10 1.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-medium">
          {t("reviewComment")}
        </label>
        <textarea
          id="comment"
          name="comment"
          maxLength={1000}
          rows={3}
          className="w-full border border-[var(--color-border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--color-ink)]"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-12 cursor-pointer bg-[var(--color-ink)] px-6 font-semibold text-[var(--color-paper)] transition-colors hover:bg-[var(--color-primary)] active:scale-[0.98] disabled:opacity-60"
      >
        {t("reviewSubmit")}
      </button>

      {status === "sent" && (
        <p role="status" className="text-sm text-[var(--color-success)]">{t("reviewSubmitted")}</p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-[var(--color-destructive)]">{t("reviewError")}</p>
      )}
      {status === "rate_limited" && (
        <p role="alert" className="text-sm text-[var(--color-destructive)]">{t("reviewRateLimited")}</p>
      )}
    </form>
  );
}
