import React from "react";
import type { SubmissionReviewSummaryDTO } from "@/services/submissionReviewService";

/**
 * Simple reviews summary card — ONLY shows title, total reviews, avg score and "Xem chi tiết" button.
 * Counts / badges removed for a cleaner UI per request.
 */
type Props = {
  summary?: any | null;
  loading?: boolean;
  onOpen: () => void;
};

function normalizeSummary(raw: any) {
  if (!raw) return { totalReviews: 0, averageScore: null };
  const s = raw?.data ?? raw;
  const reviews = Array.isArray(s?.reviews) ? s.reviews : Array.isArray(s) ? s : [];
  const totalReviews = s?.totalReviews ?? s?.completedReviewCount ?? s?.completedReviews ?? reviews.length ?? 0;
  const averageScore = s?.averageScore ?? s?.finalScore ?? null;
  return { totalReviews, averageScore };
}

export default function ReviewsSummaryCard({ summary, loading, onOpen }: Props) {
  const { totalReviews, averageScore } = normalizeSummary(summary);

  return (
    <div className="bg-white border rounded-md p-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold">Reviews</div>
        <div className="text-xs text-slate-500 mt-1">
          {loading ? "Đang tải..." : `${totalReviews ?? 0} đánh giá • Trung bình: ${averageScore != null ? `${averageScore}%` : "—"}`}
        </div>
        {/* removed small detail row (counts / badges) intentionally */}
      </div>

      <div className="flex flex-col items-end">
        <button
          onClick={onOpen}
          className="rounded border px-3 py-2 text-sm"
        >
          Xem chi tiết
        </button>
        <div className="text-xs text-slate-400 mt-2">Mở modal để xem tất cả reviews</div>
      </div>
    </div>
  );
}
