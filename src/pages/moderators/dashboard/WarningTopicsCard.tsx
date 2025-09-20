import React, { useMemo } from "react";

/**
 * Card gợi ý các topic cần chú ý (ví dụ: aiCheck thấp OR missing fields).
 * Hiện simple: trả về top k submissions có aiCheck < threshold hoặc missing_fields.
 */

type Props = {
  submissions: any[];
  detailsById?: Record<string, any>;
  loading?: boolean;
};

export default function WarningTopicsCard({ submissions = [], detailsById = {}, loading }: Props) {
  const threshold = 60; // percent
  const warnings = useMemo(() => {
    const items: { id: any; title: string; score: number | null; reason: string }[] = [];

    for (const s of submissions.slice(0, 200)) {
      const detail = detailsById?.[String(s.id)];
      let aiVal: number | null = null;
      let hasMissingFields = false;

      if (detail) {
        // parsed aiCheck
        if (detail.aiCheckDetails) {
          try {
            const parsed = typeof detail.aiCheckDetails === "string" ? JSON.parse(detail.aiCheckDetails) : detail.aiCheckDetails;
            if (parsed?.overall_score != null) aiVal = Number(parsed.overall_score);
            if (Array.isArray(parsed?.missing_fields) && parsed.missing_fields.length > 0) hasMissingFields = true;
          } catch {
            // ignore
          }
        }
        if (aiVal == null && typeof detail.aiCheckScore === "number") aiVal = detail.aiCheckScore * 10;
      }

      if (aiVal == null && s.aiCheckScore != null) {
        const v = Number(s.aiCheckScore);
        aiVal = !isNaN(v) && v <= 10 ? v * 10 : v;
      }

      const title = detail?.topicTitle ?? s.topicTitle ?? `#${s.id}`;

      if (aiVal != null && aiVal < threshold) {
        items.push({ id: s.id, title, score: aiVal, reason: `AI score ${aiVal}%` });
      } else if (hasMissingFields) {
        items.push({ id: s.id, title, score: aiVal, reason: "Missing fields (AI check)" });
      }
    }

    // sort: lowest score first, bring missing_fields after
    items.sort((a, b) => {
      const as = a.score ?? 999;
      const bs = b.score ?? 999;
      return as - bs;
    });

    return items.slice(0, 6);
  }, [submissions, detailsById]);

  return (
    <div className="rounded border p-4">
      <div className="text-sm font-semibold">Cần chú ý</div>
      <div className="mt-2">
        {loading ? (
          <div className="text-sm text-muted-foreground">Đang tải…</div>
        ) : warnings.length === 0 ? (
          <div className="text-sm text-muted-foreground">Không có cảnh báo</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {warnings.map((w) => (
              <li key={String(w.id)} className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{w.title}</div>
                  <div className="text-xs text-muted-foreground">{w.reason}</div>
                </div>
                <div className="text-sm font-semibold ml-4">{w.score != null ? `${Math.round(w.score)}%` : "—"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Danh sách lấy từ top submissions đã fetch chi tiết.</div>
    </div>
  );
}
