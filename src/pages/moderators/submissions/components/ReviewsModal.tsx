// ReviewsModal.tsx (replace)
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import ReviewItem from "./ReviewItem";

/* copy of helper functions to keep module-local */
function getFirst(obj: any, keys: string[]) {
  if (!obj) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
    const found = Object.keys(obj).find(x => x.toLowerCase() === k.toLowerCase());
    if (found) return obj[found];
  }
  return undefined;
}

function extractRecommendationFromReview(r: any) {
  if (r == null) return { raw: null, parsed: null };
  const direct = getFirst(r, ["recommendation", "Recommendation", "recommend", "recommendationText", "recommendation_value"]);
  if (typeof direct === "string" && direct.trim() !== "") return { raw: direct, parsed: direct.trim() };
  if (typeof direct === "number") {
    const map: Record<number,string> = { 1: "Approve", 2:"Minor", 3:"Major", 4:"Reject" };
    return { raw: direct, parsed: map[direct] ?? String(direct) };
  }
  const obj = typeof direct === "object" && direct !== null ? direct : (getFirst(r, ["recommendationObj", "recommendationData"]) ?? null);
  if (obj && typeof obj === "object") {
    const name = getFirst(obj, ["name","Name","value","Value","text","label"]);
    if (typeof name === "string" && name.trim() !== "") return { raw: obj, parsed: name.trim() };
    if (typeof name === "number") {
      const map: Record<number,string> = { 1: "Approve", 2:"Minor", 3:"Major", 4:"Reject" };
      return { raw: obj, parsed: map[name] ?? String(name) };
    }
  }
  const alt = getFirst(r, ["status","finalRecommendation","final_recommendation"]);
  if (typeof alt === "string" && alt.trim() !== "") return { raw: alt, parsed: alt.trim() };
  if (typeof alt === "number") {
    const map: Record<number,string> = { 1: "Approve", 2:"Minor", 3:"Major", 4:"Reject" };
    return { raw: alt, parsed: map[alt] ?? String(alt) };
  }
  try { return { raw: r, parsed: JSON.stringify(r) }; } catch { return { raw: r, parsed: null }; }
}

function normalizeSummary(raw: any) {
  try { console.debug("[ReviewsModal] raw summary:", raw); } catch {}
  if (!raw) return { reviews: [], totalReviews: 0, averageScore: null, recommendationsCount: {approve:0,minor:0,major:0,reject:0}, parsedRecommendations: [] };
  const s = raw?.data ?? raw?.result ?? raw;
  const reviews = getFirst(s, ["reviews","reviewList","items","data"]) ?? (Array.isArray(s) ? s : []);
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const totalReviews = getFirst(s, ["totalReviews","completedReviewCount","completed_review_count","total"]) ?? safeReviews.length;
  const averageScore = getFirst(s, ["averageScore","finalScore","final_score"]) ?? null;
  const provided = getFirst(s, ["recommendationsCount","recommendationCounts","recommendations_count"]) ?? null;

  const parsedRecommendations = safeReviews.map((r:any) => {
    const parsed = extractRecommendationFromReview(r);
    return { reviewId: getFirst(r, ["reviewId","id","review_id"]) ?? null, parsed: parsed.parsed, raw: parsed.raw };
  });

  let rc = null;
  if (provided) {
    rc = {
      approve: Number(getFirst(provided, ["approve","Approve","accept"])) || 0,
      minor: Number(getFirst(provided, ["minor","Minor"])) || 0,
      major: Number(getFirst(provided, ["major","Major"])) || 0,
      reject: Number(getFirst(provided, ["reject","Reject","decline"])) || 0,
    };
  } else {
    const counts = { approve:0, minor:0, major:0, reject:0 };
    for (const p of parsedRecommendations) {
      const rec = (p.parsed ?? "").toString().toLowerCase();
      if (!rec) continue;
      if (rec.includes("approve") || rec.includes("accept") || rec.includes("chấp nhận")) counts.approve++;
      else if (rec.includes("minor")) counts.minor++;
      else if (rec.includes("major")) counts.major++;
      else if (rec.includes("reject") || rec.includes("decline") || rec.includes("từ chối")) counts.reject++;
    }
    rc = counts;
  }

  return { reviews: safeReviews, totalReviews: Number(totalReviews ?? safeReviews.length), averageScore, recommendationsCount: rc, parsedRecommendations };
}

type Props = { open: boolean; onClose: () => void; summary?: any | null; loading?: boolean; onOpenRefetch?: () => Promise<any> };

export default function ReviewsModal({ open, onClose, summary, loading, onOpenRefetch }: Props) {
  useEffect(() => {
    if (!open) return;
    if (onOpenRefetch) onOpenRefetch().catch(()=>{});
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onOpenRefetch]);

  if (typeof document === "undefined") return null;
  if (!open) return null;

  const { reviews, totalReviews, averageScore, recommendationsCount, parsedRecommendations } = normalizeSummary(summary);

  try { console.debug("[ReviewsModal] parsedRecommendations:", parsedRecommendations); } catch {}

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[95%] md:w-3/4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-lg font-semibold">Danh sách đánh giá</div>
            <div className="text-xs text-slate-500">{loading ? "Đang tải..." : `${totalReviews ?? 0} đánh giá • Trung bình: ${averageScore != null ? `${averageScore}%` : "—"}`}</div>
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
              <div className="text-lg font-semibold">{averageScore != null ? `${averageScore}%` : "—"}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-xs text-slate-500">Recommendations</div>
              <div className="text-sm mt-1 flex gap-3 items-center">
                <div className="flex items-center gap-2"><span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs">Approve</span><strong>{recommendationsCount.approve ?? 0}</strong></div>
                <div className="flex items-center gap-2"><span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs">Minor</span><strong>{recommendationsCount.minor ?? 0}</strong></div>
                <div className="flex items-center gap-2"><span className="inline-block px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs">Major</span><strong>{recommendationsCount.major ?? 0}</strong></div>
                <div className="flex items-center gap-2"><span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs">Reject</span><strong>{recommendationsCount.reject ?? 0}</strong></div>
              </div>
            </div>
          </div>

          {/* DEBUG: show parsedRecommendations table so you can see exactly what was extracted */}
          <div className="mb-4 border rounded p-3 bg-slate-50">
            <div className="text-sm font-semibold mb-2">Parsed recommendations (debug)</div>
            <div className="text-xs text-slate-600 mb-2">Bảng này giúp kiểm tra backend trả gì và component đã parse gì.</div>
            <div className="text-sm">
              {parsedRecommendations.length === 0 ? <div className="text-slate-500">Không có</div> : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-700"><th className="pb-2">reviewId</th><th className="pb-2">parsed</th><th className="pb-2">raw (short)</th></tr>
                  </thead>
                  <tbody>
                    {parsedRecommendations.map((p: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 align-top">{String(p.reviewId ?? "-")}</td>
                        <td className="py-2 align-top">{String(p.parsed ?? "-")}</td>
                        <td className="py-2 align-top"><pre className="whitespace-pre-wrap max-h-24 overflow-auto text-[11px]">{typeof p.raw === "string" ? p.raw : JSON.stringify(p.raw)}</pre></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Đang tải danh sách...</div>
          ) : !reviews || reviews.length === 0 ? (
            <div className="text-sm text-slate-500">Chưa có đánh giá.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r: any) => (
                <ReviewItem key={String(r.reviewId ?? `${r.reviewerId ?? "?"}-${Math.random()}`)} review={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
