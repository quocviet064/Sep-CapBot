import React, { useMemo } from "react";

/**
 * Hiển thị:
 * - pendingReview: các submission có trạng thái UnderReview/Submitted (heuristic)
 * - noAi: submission chưa có aiCheck
 * - lowAi: aiCheck score thấp (<60%)
 */

type Props = {
  submissions: any[];
  detailsById?: Record<string, any>;
  loading?: boolean;
};

function clampNumber(n?: number) {
  if (typeof n !== "number" || !isFinite(n)) return null;
  return n;
}

export default function PendingStatusCard({ submissions = [], detailsById = {}, loading }: Props) {
  const stats = useMemo(() => {
    let pendingReview = 0;
    let noAi = 0;
    let lowAi = 0;

    submissions.forEach((s: any) => {
      const st = ((s.status as string) ?? "") .toString().toLowerCase();
      if (["underreview", "submitted", "under_review", "under-review"].includes(st)) pendingReview++;

      const detail = detailsById?.[String(s.id)];
      // prefer detail.aiCheckScore (0-10 or 0-100) or parsed.overall_score
      let aiVal: number | null = null;
      if (detail) {
        if (detail.aiCheckDetails) {
          try {
            const parsed = typeof detail.aiCheckDetails === "string" ? JSON.parse(detail.aiCheckDetails) : detail.aiCheckDetails;
            if (parsed?.overall_score != null) aiVal = Number(parsed.overall_score);
          } catch {
            // ignore
          }
        }
        if (aiVal == null && typeof detail.aiCheckScore === "number") aiVal = Number(detail.aiCheckScore) * 10;
      }

      // fallback to list item (rare)
      if (aiVal == null && s.aiCheckScore != null) {
        const v = Number(s.aiCheckScore);
        aiVal = !isNaN(v) && v <= 10 ? v * 10 : v;
      }

      if (aiVal == null) noAi++;
      else if (aiVal < 60) lowAi++;
    });

    return { pendingReview, noAi, lowAi };
  }, [submissions, detailsById]);

  return (
    <div className="rounded border p-4">
      <div className="text-sm font-semibold">Tình trạng</div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="p-2 rounded bg-slate-50 text-center">
          <div className="text-xs text-muted-foreground">Đang review</div>
          <div className="text-lg font-bold">{loading ? "..." : stats.pendingReview}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 text-center">
          <div className="text-xs text-muted-foreground">Chưa có AI</div>
          <div className="text-lg font-bold">{loading ? "..." : stats.noAi}</div>
        </div>

        <div className="p-2 rounded bg-slate-50 text-center">
          <div className="text-xs text-muted-foreground">AI score thấp</div>
          <div className="text-lg font-bold">{loading ? "..." : stats.lowAi}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">AI score tính theo % (parsed.overall_score hoặc aiCheckScore*10)</div>
    </div>
  );
}
