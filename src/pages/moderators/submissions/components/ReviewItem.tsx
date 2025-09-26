// src/pages/moderators/submissions/components/ReviewItem.tsx
import { useState } from "react";
import capBotAPI from "@/lib/CapBotApi";
import { toast } from "sonner";

type ReviewSummary = any; // giữ loose typing để tương thích với nhiều shape

function clamp(n?: number, min = 0, max = 100) {
  if (typeof n !== "number" || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

export default function ReviewItem({ review }: { review: ReviewSummary }) {
  const [expanded, setExpanded] = useState(false);
  const [scores, setScores] = useState<any | null>(null);
  const [loadingScores, setLoadingScores] = useState(false);
  const [errorScores, setErrorScores] = useState<string | null>(null);

  const reviewId = review.reviewId ?? review.id ?? review.review?.id;

  const fetchScores = async (rid: string | number) => {
    const ridStr = String(rid);
    if (loadingScores) return;
    setLoadingScores(true);
    setErrorScores(null);
    try {
      const res = await capBotAPI.get<any>(`/reviews/${encodeURIComponent(ridStr)}/scores`);
      const payload = res?.data?.data ?? res?.data ?? null;
      if (!payload) {
        setErrorScores("Không có dữ liệu chi tiết");
        setScores(null);
      } else {
        setScores(payload);
      }
    } catch (err: any) {
      const msg = (err?.response?.data?.message as string) ?? err?.message ?? "Lỗi khi tải chi tiết điểm";
      setErrorScores(msg);
      toast.error(msg);
    } finally {
      setLoadingScores(false);
    }
  };

  const onToggle = async () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    if (willExpand && !scores && reviewId != null) {
      await fetchScores(reviewId);
    }
  };

  const renderScoreDetails = (scoresAny: any) => {
    if (!scoresAny) return <div className="text-sm text-slate-500">Không có chi tiết điểm.</div>;
    if (Array.isArray(scoresAny)) {
      return (
        <div className="space-y-2">
          {scoresAny.map((c: any, i: number) => (
            <div key={i} className="border rounded p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{c.criterionName ?? c.name ?? c.title ?? `Criterion ${i + 1}`}</div>
                <div className="text-sm text-slate-600">{c.score ?? c.points ?? "-"}</div>
              </div>
              {c.comment && <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{c.comment}</div>}
            </div>
          ))}
        </div>
      );
    }
    if (typeof scoresAny === "object") {
      if (Array.isArray(scoresAny.criteria)) return renderScoreDetails(scoresAny.criteria);
      const keys = Object.keys(scoresAny);
      return (
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k} className="border rounded p-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{k}</div>
                <div className="text-sm text-slate-600">{String((scoresAny as any)[k])}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <div className="text-sm text-slate-500">Không có dữ liệu điểm theo định dạng mong đợi.</div>;
  };

  return (
    <div className="border rounded p-3">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{review.reviewerName ?? `Reviewer ${review.reviewerId ?? "-"}`}</div>
            <div className="text-xs text-slate-400">#{review.reviewerId ?? "-"}</div>
            <div className="ml-auto text-sm text-slate-600">{review.overallScore != null ? `${review.overallScore}%` : "—"}</div>
          </div>

          <div className="text-xs text-slate-500 mt-1">
            Recommendation: <span className="font-medium">{String(review.recommendation ?? "—")}</span>
          </div>

          {review.comment && <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{review.comment}</div>}

          {Array.isArray(review.criteria) && review.criteria.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Detailed criteria (summary)</div>
              <div className="space-y-2">
                {review.criteria.map((c: any, i: number) => (
                  <div key={i} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{c.name ?? c.Name ?? `Criterion ${i + 1}`}</div>
                      <div className="text-sm text-slate-500">{c.score ?? c.Score ?? "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-3 flex flex-col gap-2 items-end">
          <button className="text-xs text-slate-500" onClick={onToggle}>
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 bg-slate-50 p-3 rounded">
          {loadingScores ? (
            <div className="text-sm text-slate-500">Đang tải chi tiết điểm...</div>
          ) : errorScores ? (
            <div className="text-sm text-rose-600">Lỗi: {errorScores}</div>
          ) : scores ? (
            <>
              <div className="text-sm font-semibold mb-2">Chi tiết điểm</div>
              {renderScoreDetails(scores)}
            </>
          ) : (
            <div className="text-sm text-slate-500">Không có dữ liệu chi tiết điểm.</div>
          )}
        </div>
      )}
    </div>
  );
}
