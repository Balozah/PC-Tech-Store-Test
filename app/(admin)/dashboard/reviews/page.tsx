import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { ReviewRow } from "@/components/dashboard/review-row";
import { isSupabaseConfigured } from "@/lib/data";
import { getPendingReviews } from "@/lib/data-admin";

export default async function ReviewsPage() {
  const configured = isSupabaseConfigured();
  const reviews = configured ? await getPendingReviews() : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">التقييمات بانتظار الموافقة</h1>
      {!configured && <SupabaseNotice />}
      <div className="space-y-3">
        {reviews.map((r) => (
          <ReviewRow key={r.id} review={r} />
        ))}
        {configured && reviews.length === 0 && (
          <p className="text-sm text-[var(--color-muted-foreground)]">لا توجد تقييمات بانتظار الموافقة.</p>
        )}
      </div>
    </div>
  );
}
