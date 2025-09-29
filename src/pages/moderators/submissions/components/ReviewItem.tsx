import { useEffect, useState, useRef } from "react";
import capBotAPI from "@/lib/CapBotApi";
import { toast } from "sonner";

type ReviewSummary = any;

function clamp(n?: number, min = 0, max = 100) {
  if (typeof n !== "number" || !isFinite(n)) return 0;
  return Math.max(min, Math.min(max, n));
}
function fmtNumber(n?: number, digits = 2) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toFixed(digits);
}

function recTextFromAny(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") {
    if (val === 1) return "Approve";
    if (val === 2) return "Minor";
    if (val === 3) return "Major";
    if (val === 4) return "Reject";
    return String(val);
  }
  try {
    const o: any = val as any;
    const maybe = o.name ?? o.value ?? o.label ?? o.type ?? null;
    if (typeof maybe === "string") return maybe;
    if (typeof maybe === "number") return recTextFromAny(maybe);
  } catch {}
  return null;
}

/** Badge hiển thị recommendation — nhận text (ưu tiên)*/
function RecommendationBadge({
  recommendation,
  recommendationText,
}: {
  recommendation?: any;
  recommendationText?: string | null;
}) {
  const txt = recommendationText ?? recTextFromAny(recommendation) ?? "";
  const rec = txt.toString().trim().toLowerCase();

  if (!rec) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">—</span>;
  }

  if (rec.includes("approve") || rec.includes("accept") || rec.includes("chấp nhận") || rec.includes("đồng ý")) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">Approve</span>;
  }
  if (rec.includes("minor")) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">Minor</span>;
  }
  if (rec.includes("major")) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">Major</span>;
  }
  if (rec.includes("reject") || rec.includes("decline") || rec.includes("từ chối")) {
    return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700">Reject</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{String(txt)}</span>;
}

export default function ReviewItem({ review, recommendationText }: { review: ReviewSummary; recommendationText?: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [scoresPayload, setScoresPayload] = useState<any | null>(null);
  const [loadingScores, setLoadingScores] = useState(false);
  const [errorScores, setErrorScores] = useState<string | null>(null);

  // to avoid state update after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reviewId = review?.reviewId ?? review?.id ?? review?.review?.id ?? null;

  const fetchScores = async (rid: string | number) => {
    const ridStr = String(rid);
    if (loadingScores) return;
    setLoadingScores(true);
    setErrorScores(null);
    try {
      const res = await capBotAPI.get<any>(`/reviews/${encodeURIComponent(ridStr)}/scores`);
      const payloadWrapper = res?.data;
      let payloadData: any = null;

      if (payloadWrapper == null) payloadData = null;
      else if (payloadWrapper.data !== undefined) payloadData = payloadWrapper.data;
      else payloadData = payloadWrapper;

      if (!payloadData) {
        if (mountedRef.current) {
          setErrorScores("Không có dữ liệu điểm chi tiết");
          setScoresPayload(null);
        }
      } else {
        if (mountedRef.current) {
          setScoresPayload(payloadData);
        }
      }
    } catch (err: any) {
      const msg = (err?.response?.data?.message as string) ?? err?.message ?? "Lỗi khi tải chi tiết điểm";
      if (mountedRef.current) {
        setErrorScores(msg);
      }
      toast.error(msg);
    } finally {
      if (mountedRef.current) setLoadingScores(false);
    }
  };

  const onToggle = async () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    if (willExpand && !scoresPayload && reviewId != null) {
      await fetchScores(reviewId);
    }
  };

  const renderScoreDetails = (payload: any) => {
    if (!payload) return <div className="text-sm text-slate-500">Không có chi tiết điểm.</div>;

    const overall = payload.overallScore ?? payload.overall_score ?? null;
    const criteria = payload.criteriaScores ?? payload.criteria_scores ?? payload.criteria ?? [];

    return (
      <div className="space-y-3">
        <div className="rounded border p-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Overall score</div>
            <div className="text-sm font-semibold">{overall != null ? `${fmtNumber(overall, 2)}` : "—"}</div>
          </div>
        </div>

        {Array.isArray(criteria) && criteria.length > 0 ? (
          <div className="space-y-2">
            {criteria.map((c: any, i: number) => {
              const name = c.criteriaName ?? c.criteria_name ?? c.name ?? `Tiêu chí ${i + 1}`;
              const score = c.score ?? c.Score ?? c.value ?? null;
              const maxScore = c.maxScore ?? c.max_score ?? c.max ?? null;
              const weight = c.weight ?? c.Weight ?? null;
              const comment = c.comment ?? c.Comment ?? c.note ?? null;
              const pct = maxScore ? clamp((Number(score ?? 0) / Number(maxScore)) * 100, 0, 100) : clamp(Number(score ?? 0), 0, 100);

              const keyId = String(c.criteriaId ?? c.criteria_id ?? c.id ?? i);

              return (
                <div key={keyId} className="border rounded p-3 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Score: <span className="font-semibold">{score != null ? `${fmtNumber(score, 2)}` : "—"}</span>
                        {maxScore != null && <span> / {fmtNumber(maxScore, 0)}</span>}
                        {weight != null && <span> • Weight: {fmtNumber(weight, 2)}</span>}
                      </div>
                    </div>
                    <div className="w-36 hidden sm:block">
                      <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-2 ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 text-right">{Math.round(pct)}%</div>
                    </div>
                  </div>

                  {comment && <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">Comment: {comment}</div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Không có tiêu chí chi tiết.</div>
        )}
      </div>
    );
  };

  return (
    <div className="border rounded p-3 bg-slate-50">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold">{review.reviewerName ?? `Reviewer ${review.reviewerId ?? "-"}`}</div>
            <div className="text-xs text-slate-400">#{review.reviewerId ?? "-"}</div>

            {/* recommendation badge: ưu tiên recommendationText */}
            <div className="ml-2">
              <RecommendationBadge recommendation={review.recommendation ?? review.Recommendation ?? null} recommendationText={recommendationText ?? (review.recommendationText ?? null)} />
            </div>

            <div className="ml-auto text-sm text-slate-600">{review.overallScore != null ? `${fmtNumber(review.overallScore, 2)}` : "—"}</div>
          </div>

          {review.comment && <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{review.comment}</div>}
        </div>

        <div className="ml-3 flex flex-col gap-2 items-end">
          <button className="text-xs text-slate-500" onClick={onToggle}>
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 p-3 rounded bg-white border">
          {loadingScores ? (
            <div className="text-sm text-slate-500">Đang tải chi tiết điểm...</div>
          ) : errorScores ? (
            <div className="text-sm text-rose-600">Lỗi: {errorScores}</div>
          ) : scoresPayload ? (
            <>
              <div className="text-sm font-semibold mb-2">Chi tiết điểm</div>
              {renderScoreDetails(scoresPayload)}
            </>
          ) : (
            <div className="text-sm text-slate-500">Không có dữ liệu chi tiết điểm.</div>
          )}
        </div>
      )}
    </div>
  );
}
