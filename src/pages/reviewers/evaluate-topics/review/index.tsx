import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import { Textarea } from "@/components/globals/atoms/textarea";
import LoadingPage from "@/pages/loading-page";
import { useCurrentSemesterCriteria } from "@/hooks/useEvaluationCriteria";
import { useCreateReview, useUpdateReview, useSubmitReview, useReviewDetail } from "@/hooks/useReview";
import type { IdLike } from "@/services/reviewService";

/**
 * Enhanced UI review editor:
 * - Header with breadcrumb-like info
 * - Summary bar shows computed overall score & status
 * - Choice cards visually styled
 * - Recommendation as pill buttons
 * - Submit disabled until saved (if you want strict flow)
 */

const CHOICES = [
  { key: "excellent", label: "Excellent", sub: "8 - 10", value: 90 },
  { key: "good", label: "Good", sub: "6 - 8", value: 70 },
  { key: "acceptable", label: "Acceptable", sub: "4 - 6", value: 50 },
  { key: "fail", label: "Fail", sub: "0 - 4", value: 20 },
] as const;

const RECOMMENDATIONS = [
  { key: "Approve", label: "Approve" },
  { key: "Revise", label: "Revise" },
  { key: "Reject", label: "Reject" },
];

type RowScore = {
  criteriaId: number;
  choice: "" | "excellent" | "good" | "acceptable" | "fail";
  score: number | "";
  comment?: string | null;
};

function clsx(...xs: any[]) {
  return xs.filter(Boolean).join(" ");
}

export default function ReviewerReviewEditor() {
  const [searchParams] = useSearchParams();
  const assignmentIdParam = searchParams.get("assignmentId");
  const reviewIdParam = searchParams.get("reviewId");
  const assignmentId: number | null = useMemo(() => (assignmentIdParam ? Number(assignmentIdParam) : null), [assignmentIdParam]);
  const incomingReviewId: number | null = useMemo(() => (reviewIdParam ? Number(reviewIdParam) : null), [reviewIdParam]);

  // dùng hook lấy tiêu chí active/current semester
  const { data: criteriaList, isLoading: criteriaLoading } = useCurrentSemesterCriteria();

  const [rows, setRows] = useState<RowScore[]>([]);
  const [overallComment, setOverallComment] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string | undefined>(undefined);

  // track whether last save created/updated a draft (used to enable submit if desired)
  const [isSavedDraft, setIsSavedDraft] = useState<boolean>(!!incomingReviewId || false);

  // local reviewId state (draft created or loaded)
  const [reviewId, setReviewId] = useState<IdLike | null>(incomingReviewId);

  // hooks
  const createMut = useCreateReview();
  const updateMut = useUpdateReview();
  const submitMut = useSubmitReview();
  const reviewDetailQuery = useReviewDetail(reviewId ?? undefined);

  // initialize rows when criteriaList available
  useEffect(() => {
    if (!criteriaList) return;
    setRows(
      (criteriaList || []).map((c: any) => ({
        criteriaId: c.id,
        choice: "" as RowScore["choice"],
        score: "" as number | "",
        comment: "",
      }))
    );
  }, [criteriaList]);

  // if reviewId present, load review and populate form
  useEffect(() => {
    if (!reviewDetailQuery?.data) return;
    const rv = reviewDetailQuery.data;
    setReviewId(rv.id ?? reviewId);
    setOverallComment(rv.overallComment ?? "");
    setRecommendation((rv as any).recommendation ?? undefined);

    if (Array.isArray(rv.criteriaScores)) {
      setRows((prev) => {
        const base = prev.length
          ? prev
          : (criteriaList || []).map((c: any) => ({ criteriaId: c.id, choice: "" as any, score: "" as any, comment: "" }));
        const mapped = base.map((r) => {
          const cs = (rv.criteriaScores || []).find((s: any) => Number(s.criteriaId) === Number(r.criteriaId));
          if (!cs) return r;
          const scoreVal = Number(cs.score ?? cs.Score ?? 0);
          let choiceKey: RowScore["choice"] = "";
          if (scoreVal >= 80) choiceKey = "excellent";
          else if (scoreVal >= 60) choiceKey = "good";
          else if (scoreVal >= 40) choiceKey = "acceptable";
          else choiceKey = "fail";
          return { ...r, choice: choiceKey, score: scoreVal, comment: cs.comment ?? null };
        });
        return mapped;
      });
    }
    setIsSavedDraft(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewDetailQuery?.data, criteriaList]);

  const choiceToScore = (choice: RowScore["choice"]) => {
    if (!choice) return "";
    const found = CHOICES.find((c) => c.key === choice);
    return found ? found.value : "";
  };

  const setChoice = (criteriaId: number, choice: RowScore["choice"]) => {
    const repValue = choiceToScore(choice);
    setRows((prev) => prev.map((r) => (r.criteriaId === criteriaId ? { ...r, choice, score: repValue } : r)));
    setIsSavedDraft(false);
  };

  const setComment = (criteriaId: number, comment: string) => {
    setRows((prev) => prev.map((r) => (r.criteriaId === criteriaId ? { ...r, comment } : r)));
    setIsSavedDraft(false);
  };

  const validate = (): string | null => {
    if (!assignmentId) return "Thiếu assignmentId";
    const hasChoice = rows.some((r) => r.choice && r.choice !== "");
    if (!hasChoice) return "Bạn cần chọn mức ít nhất một tiêu chí";
    return null;
  };

  const buildCreatePayload = (): any => ({
    assignmentId: assignmentId as IdLike,
    overallComment: overallComment || undefined,
    recommendation: recommendation || undefined,
    criteriaScores: rows
      .filter((r) => r.choice && r.choice !== "")
      .map((r) => ({ criteriaId: r.criteriaId, score: typeof r.score === "number" ? r.score : undefined, comment: r.comment ?? undefined })),
  });

  // Save draft: create or update
  const handleSaveDraft = async () => {
    const v = validate();
    if (v) {
      alert(v);
      return;
    }
    try {
      if (reviewId) {
        const payload = {
          id: reviewId,
          assignmentId: assignmentId as IdLike,
          criteriaScores: rows
            .filter((r) => r.choice && r.choice !== "")
            .map((r) => ({ criteriaId: r.criteriaId, score: typeof r.score === "number" ? r.score : undefined, comment: r.comment ?? undefined })),
          overallComment: overallComment || undefined,
          recommendation: recommendation || undefined,
        };
        const updated = await updateMut.mutateAsync(payload);
        setReviewId((updated as any)?.id ?? reviewId);
        setIsSavedDraft(true);
        alert("Đã cập nhật bản nháp");
        return updated;
      } else {
        const payload = buildCreatePayload();
        const created = await createMut.mutateAsync(payload);
        setReviewId((created as any)?.id ?? null);
        setIsSavedDraft(true);
        alert("Đã lưu nháp (tạo mới)");
        return created;
      }
    } catch (e: any) {
      alert(e?.message || "Lưu thất bại");
      throw e;
    }
  };

  const handleSubmit = async () => {
    if (!assignmentId) {
      alert("Thiếu assignmentId");
      return;
    }
    try {
      // optional: enforce save-first (enableSubmitWhenSaved = true)
      const enableSubmitWhenSaved = true;
      if (enableSubmitWhenSaved && !isSavedDraft) {
        alert("Vui lòng lưu nháp trước khi gửi đánh giá");
        return;
      }

      let idToSubmit = reviewId;
      if (!idToSubmit) {
        const created = await createMut.mutateAsync(buildCreatePayload());
        idToSubmit = (created as any)?.id ?? null;
        setReviewId(idToSubmit);
      }
      if (!idToSubmit) {
        alert("Không có reviewId để submit");
        return;
      }
      await submitMut.mutateAsync(idToSubmit);
      alert("Submit thành công");
    } catch (e: any) {
      alert(e?.message || "Submit thất bại");
      throw e;
    }
  };

  // compute a preview overall score (average of selected choices)
  const computedOverall = useMemo(() => {
    const chosen = rows.filter((r) => typeof r.score === "number" && r.score !== "");
    if (!chosen.length) return null;
    // average of numeric scores (0-100 scaled)
    const sum = chosen.reduce((s, c) => s + Number(c.score || 0), 0);
    const avg = Math.round((sum / chosen.length) * 100) / 100;
    // map to 0-10 scale for display (since backend uses overallScore maybe 0-10)
    const scale10 = Math.round((avg / 10) * 10) / 10;
    return { raw: avg, scaled10: scale10 };
  }, [rows]);

  if (!assignmentId) {
    return <div className="p-6 text-red-600">Thiếu assignmentId trong URL</div>;
  }
  if (criteriaLoading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Đánh giá assignment #{assignmentId}</h1>
          <p className="text-sm text-muted-foreground">
            {reviewId ? `Chỉnh sửa bản nháp (reviewId: ${String(reviewId)})` : "Chưa lưu nháp — bắt đầu đánh giá"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* overall preview */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Overall preview</div>
            <div className="flex items-baseline gap-3">
              <div className="text-2xl font-bold">
                {computedOverall ? `${computedOverall.scaled10}/10` : "--/10"}
              </div>
              <div className="text-sm text-muted-foreground">{computedOverall ? `${computedOverall.raw}/100` : ""}</div>
            </div>
            <div className="w-36 h-2 bg-slate-100 rounded mt-2 overflow-hidden">
              <div
                style={{ width: `${computedOverall ? Math.min(100, computedOverall.raw) : 0}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-lime-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveDraft}>Lưu nháp</Button>
            <Button size="sm" variant="primary" onClick={handleSubmit} disabled={!!(!isSavedDraft)} title={isSavedDraft ? "Gửi đánh giá" : "Hãy lưu nháp trước khi gửi"}>
              Gửi đánh giá
            </Button>
          </div>
        </div>
      </div>

      {/* overall comment + recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded border p-4 bg-white shadow-sm">
          <label className="block text-sm font-medium mb-2">Nhận xét tổng quát</label>
          <Textarea value={overallComment} onChange={(e) => { setOverallComment(e.target.value); setIsSavedDraft(false); }} placeholder="Nhận xét chung..." rows={4} />
        </div>

        <div className="rounded border p-4 bg-white shadow-sm">
          <div className="text-sm font-medium mb-2">Recommendation</div>
          <div className="flex flex-col gap-2">
            {RECOMMENDATIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                className={clsx(
                  "py-2 px-3 rounded text-sm border",
                  recommendation === r.key ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 hover:bg-slate-50"
                )}
                onClick={() => { setRecommendation(r.key); setIsSavedDraft(false); }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Chọn recommendation tổng quát cho reviewer.
          </div>
        </div>
      </div>

      {/* Criteria list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tiêu chí đánh giá</h2>

        <div className="grid gap-4">
          {rows.map((r) => {
            const meta = (criteriaList || []).find((c: any) => c.id === r.criteriaId) ?? {};
            return (
              <div key={r.criteriaId} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-md">{meta.name ?? `Tiêu chí ${r.criteriaId}`}</div>
                    <div className="text-sm text-muted-foreground mt-1">{meta.description ?? ""}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Chọn mức</div>
                    <div className="text-lg font-semibold">{r.choice ? CHOICES.find(c => c.key === r.choice)!.label : "--"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{r.choice ? `${r.score}` : ""}</div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* choice cards */}
                  {CHOICES.map((c) => {
                    const sel = r.choice === c.key;
                    return (
                      <label
                        key={c.key}
                        className={clsx(
                          "cursor-pointer rounded-lg p-3 border flex flex-col items-start gap-1",
                          sel ? "bg-indigo-50 border-indigo-300 shadow-sm" : "hover:shadow-sm bg-white"
                        )}
                        onClick={() => setChoice(r.criteriaId, c.key)}
                      >
                        <div className="text-sm font-semibold">{c.label}</div>
                        <div className="text-xs text-muted-foreground">{c.sub}</div>
                        <div className="mt-2 text-sm font-medium">{c.value}</div>
                        <input type="radio" name={`choice-${r.criteriaId}`} value={c.key} checked={sel} readOnly className="hidden" />
                      </label>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Ghi chú (từng tiêu chí)</label>
                  <Textarea value={r.comment ?? ""} onChange={(e) => setComment(r.criteriaId, e.target.value)} placeholder="Ghi chú..." rows={2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
