import { SupabaseNotice } from "@/components/dashboard/supabase-notice";
import { ReviewRow } from "@/components/dashboard/review-row";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { isSupabaseConfigured } from "@/lib/data";
import { getPendingReviews } from "@/lib/data-admin";

export const metadata = { title: "التقييمات" };

export default async function ReviewsPage() {
  const configured = isSupabaseConfigured();
  const reviews = configured ? await getPendingReviews() : [];

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
    </div>
  );
}
