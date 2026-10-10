import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { ReviewRow } from "@/components/dashboard/review-row";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { isSupabaseConfigured } from "@/lib/data";
import { getApprovedReviews, getPendingReviews } from "@/lib/data-admin";

export const metadata = { title: "التقييمات" };

export default async function ReviewsPage() {
  const configured = isSupabaseConfigured();
  const [reviews, approved] = configured ? await Promise.all([getPendingReviews(), getApprovedReviews()]) : [[], []];

  return (
    <div>
      <PageHeader
        title="التقييمات"
        description="ما في تقييم بيطلع عالموقع قبل ما توافق عليه."
      />
      {!configured && <SupabaseNotice />}
      {reviews.length === 0 ? (
        <EmptyState icon="star" title="ما في تقييمات بانتظارك" description="لما يكتب زبون تقييم، بيوصل لهون." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} />
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <section aria-labelledby="approved-title" className="mt-10">
          <h2 id="approved-title" className="text-lg font-bold">منشورة عالموقع</h2>
          <p className="mb-4 mt-1 text-sm text-[var(--color-muted-foreground)]">فيك تحذف أي تقييم منشور من هون.</p>
          <div className="space-y-3">
            {approved.map((r) => (
              <ReviewRow key={r.id} review={r} approved />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
