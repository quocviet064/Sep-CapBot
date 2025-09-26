import ReviewItem from "./ReviewItem";
import type { SubmissionReviewSummaryDTO } from "@/services/submissionReviewService";

type Props = {
  showReviews: boolean;
  loadingSummary: boolean;
  summary?: SubmissionReviewSummaryDTO | null;
  onToggleShowReviews: () => void;
};

export default function ReviewsSection({ showReviews, loadingSummary, summary, onToggleShowReviews }: Props) {
  return (
    <>
      {showReviews && (
        <div className="bg-white border rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Reviews</div>
            <div className="text-sm text-slate-500">{loadingSummary ? "Đang tải..." : `Total: ${summary?.totalReviews ?? 0}`}</div>
          </div>

          {/* Summary row */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Tổng đánh giá</div>
              <div className="text-lg font-semibold">{summary?.totalReviews ?? 0}</div>
            </div>

            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Điểm trung bình</div>
              <div className="text-lg font-semibold">{summary?.averageScore != null ? `${summary.averageScore}%` : "—"}</div>
            </div>

            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Recommendations</div>
              <div className="text-sm mt-1 flex gap-3">
                <div>Approve: <span className="font-semibold">{summary?.recommendationsCount.approve ?? 0}</span></div>
                <div>Minor: <span className="font-semibold">{summary?.recommendationsCount.minor ?? 0}</span></div>
                <div>Major: <span className="font-semibold">{summary?.recommendationsCount.major ?? 0}</span></div>
                <div>Reject: <span className="font-semibold">{summary?.recommendationsCount.reject ?? 0}</span></div>
              </div>
            </div>
          </div>

          {/* Final decision */}
          {summary?.finalDecision && (
            <div className="mb-4 p-3 rounded border bg-slate-50">
              <div className="text-sm font-semibold">Final decision</div>
              <div className="text-sm text-slate-700">
                Recommendation: <span className="font-semibold">{String(summary.finalDecision.finalRecommendation)}</span>
              </div>
              <div className="text-sm">Score: {summary.finalDecision.finalScore ?? "—"}</div>
            </div>
          )}

          {/* Reviews list */}
          <div>
            {loadingSummary ? (
              <div className="text-sm text-slate-500">Đang tải danh sách đánh giá...</div>
            ) : !summary || !Array.isArray(summary.reviews) || summary.reviews.length === 0 ? (
              <div className="text-sm text-slate-500">Chưa có đánh giá cho submission này.</div>
            ) : (
              <div className="space-y-3">
                {summary.reviews.map((r) => (
                  <ReviewItem key={String(r.reviewId ?? `${r.reviewerId}-${Math.random()}`)} review={r} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </>
  );
}
