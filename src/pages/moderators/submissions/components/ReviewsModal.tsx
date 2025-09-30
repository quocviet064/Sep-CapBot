import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import ReviewItem from "./ReviewItem";

function getFirst(obj: any, keys: string[]) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
    const found = Object.keys(obj).find(x => x.toLowerCase() === k.toLowerCase());
    if (found) return obj[found];
  }
  return undefined;
}

/** map recommendation */
function mapRecommendationToText(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) {
    const n = Number(val);
    if (n === 1) return "Approve";
    if (n === 2) return "Minor";
    if (n === 3) return "Major";
    if (n === 4) return "Reject";
    return String(n);
  }
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    if (v === "approve" || v === "accepted" || v === "accept" || v.includes("chấp nhận") || v.includes("đồng ý")) return "Approve";
    if (v.includes("minor")) return "Minor";
    if (v.includes("major")) return "Major";
    if (v === "reject" || v === "rejected" || v === "decline" || v.includes("từ chối")) return "Reject";
    return val.trim();
  }
  if (typeof val === "object") {
    try {
      const o: any = val as any;
      const candidates = [o.value, o.name, o.id, o.label, o.type];
      for (const c of candidates) {
        const t = mapRecommendationToText(c);
        if (t) return t;
      }
    } catch {}
  }
  return null;
}

function normalizeSummary(raw: any) {
  if (!raw) return { reviews: [], totalReviews: 0, averageScore: null, recommendationsCount: { approve: 0, minor: 0, major: 0, reject: 0 } };

  const s = raw?.data ?? raw?.result ?? raw;
  const reviewsRaw = getFirst(s, ["reviews","reviewList","items","data"]) ?? (Array.isArray(s) ? s : []);
  const safeReviews = Array.isArray(reviewsRaw) ? reviewsRaw : [];

  const totalReviews = getFirst(s, ["totalReviews","completedReviewCount","completed_review_count","total"]) ?? safeReviews.length;
  const averageScore = getFirst(s, ["averageScore","finalScore","final_score"]) ?? null;

  const provided = getFirst(s, ["recommendationsCount","recommendationCounts","recommendations_count"]) ?? null;
  let recommendationsCount = null;
  if (provided) {
    recommendationsCount = {
      approve: Number(getFirst(provided, ["approve","Approve","accept"])) || 0,
      minor: Number(getFirst(provided, ["minor","Minor"])) || 0,
      major: Number(getFirst(provided, ["major","Major"])) || 0,
      reject: Number(getFirst(provided, ["reject","Reject","decline"])) || 0,
    };
  }

  const parsedRecommendations = safeReviews.map((r: any) => {
    const rawRec = getFirst(r, ["recommendation","Recommendation","recommend","recommendationText","recommendation_value","recommendationValue"]) ?? null;
    const parsedText = mapRecommendationToText(rawRec);
    return { reviewId: getFirst(r, ["reviewId","id","review_id"]) ?? null, parsedText, raw: rawRec };
  });

  if (!recommendationsCount) {
    const counts = { approve: 0, minor: 0, major: 0, reject: 0 };
    for (const p of parsedRecommendations) {
      const rec = (p.parsedText ?? "").toString().toLowerCase();
      if (!rec) continue;
      if (rec.includes("approve") || rec.includes("accept") || rec.includes("chấp nhận")) counts.approve++;
      else if (rec.includes("minor")) counts.minor++;
      else if (rec.includes("major")) counts.major++;
      else if (rec.includes("reject") || rec.includes("decline") || rec.includes("từ chối")) counts.reject++;
    }
    recommendationsCount = counts;
  }

  // attach recommendationText onto each review so ReviewItem can show text
  const reviewsWithText = safeReviews.map((r: any, i: number) => {
    const parsedObj = parsedRecommendations[i];
    const recText = parsedObj?.parsedText ?? null;
    return { ...r, recommendationText: recText };
  });

  return { reviews: reviewsWithText, totalReviews: Number(totalReviews ?? reviewsWithText.length), averageScore, recommendationsCount };
}

type Props = {
  open: boolean;
  onClose: () => void;
  summary?: any | null;
  loading?: boolean;
  onOpenRefetch?: () => Promise<any>;
};

export default function ReviewsModal({ open, onClose, summary, loading, onOpenRefetch }: Props) {
  useEffect(() => {
    if (!open) return;
    // try refetch once when opened
    if (onOpenRefetch) {
      onOpenRefetch().catch(() => {});
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onOpenRefetch]);

  if (typeof document === "undefined") return null;
  if (!open) return null;

  const { reviews, totalReviews, averageScore, recommendationsCount } = normalizeSummary(summary);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[95%] md:w-3/4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-lg font-semibold">Danh sách đánh giá</div>
            <div className="text-xs text-slate-500">{loading ? "Đang tải..." : `${totalReviews ?? 0} đánh giá • Trung bình: ${averageScore != null ? `${averageScore}` : "—"}`}</div>
          </div>
          <div><button className="rounded border px-3 py-1 text-sm" onClick={onClose}>Đóng</button></div>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(85vh - 88px)" }}>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Tổng đánh giá</div>
              <div className="text-lg font-semibold">{totalReviews ?? "—"}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Điểm trung bình</div>
              <div className="text-lg font-semibold">{averageScore != null ? `${averageScore}` : "—"}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Recommendations</div>
              <div className="text-sm mt-1 flex gap-3 items-center">
                <div className="flex items-center gap-2"><span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">Approve</span><strong>{recommendationsCount.approve ?? 0}</strong></div>
                <div className="flex items-center gap-2"><span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs">Reject</span><strong>{recommendationsCount.reject ?? 0}</strong></div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Đang tải danh sách...</div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-sm text-slate-500">Chưa có đánh giá.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <ReviewItem key={String(r.reviewId ?? `${r.reviewerId ?? "?"}-${Math.random()}`)} review={r} recommendationText={r.recommendationText ?? null} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
