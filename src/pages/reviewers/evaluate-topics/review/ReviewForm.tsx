import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import { Textarea } from "@/components/globals/atoms/textarea";
import {
  useCreateReview,
  useUpdateReview,
  useSubmitReview,
  useReviewDetail,
} from "@/hooks/useReview";
import type { IdLike } from "@/services/reviewService";

const CHOICES = [
  { key: "excellent", label: "Excellent", sub: "8 - 10", value: 90 },
  { key: "good", label: "Good", sub: "6 - 8", value: 70 },
  { key: "acceptable", label: "Acceptable", sub: "4 - 6", value: 50 },
  { key: "fail", label: "Fail", sub: "0 - 4", value: 20 },
] as const;

const RECOMMENDATIONS = [
  { key: "Approve", label: "Approve" },
  { key: "Reject", label: "Reject" },
];

type RowScore = {
  criteriaId: number;
  choice: "" | "excellent" | "good" | "acceptable" | "fail";
  score: number | "";
  comment?: string | null;
};

type Props = {
  assignmentId: IdLike;
  reviewId?: IdLike | null;
  criteriaList: any[];
};

function clsx(...xs: any[]) {
  return xs.filter(Boolean).join(" ");
}

export default function ReviewForm({ assignmentId, reviewId: incomingReviewId, criteriaList }: Props) {
  const [rows, setRows] = useState<RowScore[]>([]);
  const [overallComment, setOverallComment] = useState("");
  const [recommendation, setRecommendation] = useState<string | undefined>(undefined);
  const [isSavedDraft, setIsSavedDraft] = useState(!!incomingReviewId);
  const [reviewId, setReviewId] = useState<IdLike | null>(incomingReviewId ?? null);

  const createMut = useCreateReview();
  const updateMut = useUpdateReview();
  const submitMut = useSubmitReview();
  const reviewDetailQuery = useReviewDetail(reviewId ?? undefined);

  useEffect(() => {
    if (!criteriaList) return;
    setRows(criteriaList.map((c: any) => ({
      criteriaId: c.id,
      choice: "",
      score: "",
      comment: "",
    })));
  }, [criteriaList]);

  useEffect(() => {
    if (!reviewDetailQuery?.data) return;
    const rv = reviewDetailQuery.data;
    setReviewId(rv.id ?? reviewId);
    setOverallComment(rv.overallComment ?? "");
    setRecommendation((rv as any).recommendation ?? undefined);

    if (Array.isArray(rv.criteriaScores)) {
      setRows((prev) => {
        const base = prev.length ? prev : (criteriaList || []).map((c: any) => ({
          criteriaId: c.id,
          choice: "",
          score: "",
          comment: "",
        }));
        return base.map((r) => {
          const cs = rv.criteriaScores.find((s: any) => Number(s.criteriaId) === Number(r.criteriaId));
          if (!cs) return r;
          const scoreVal = Number(cs.score ?? 0);
          let choiceKey: RowScore["choice"] = "";
          if (scoreVal >= 80) choiceKey = "excellent";
          else if (scoreVal >= 60) choiceKey = "good";
          else if (scoreVal >= 40) choiceKey = "acceptable";
          else choiceKey = "fail";
          return { ...r, choice: choiceKey, score: scoreVal, comment: cs.comment ?? null };
        });
      });
    }
    setIsSavedDraft(true);
  }, [reviewDetailQuery?.data, criteriaList, reviewId]);

  const choiceToScore = (choice: RowScore["choice"]) => {
    const found = CHOICES.find((c) => c.key === choice);
    return found ? found.value : "";
  };

  const setChoice = (criteriaId: number, choice: RowScore["choice"]) => {
    setRows((prev) => prev.map((r) => (
      r.criteriaId === criteriaId ? { ...r, choice, score: choiceToScore(choice) } : r
    )));
    setIsSavedDraft(false);
  };

  const setComment = (criteriaId: number, comment: string) => {
    setRows((prev) => prev.map((r) => (
      r.criteriaId === criteriaId ? { ...r, comment } : r
    )));
    setIsSavedDraft(false);
  };

  const buildPayload = () => ({
    assignmentId,
    overallComment: overallComment || undefined,
    recommendation: recommendation || undefined,
    criteriaScores: rows
      .filter((r) => r.choice)
      .map((r) => ({
        criteriaId: r.criteriaId,
        score: typeof r.score === "number" ? r.score : undefined,
        comment: r.comment ?? undefined,
      })),
  });

  const handleSaveDraft = async () => {
    try {
      if (reviewId) {
        const updated = await updateMut.mutateAsync({ ...buildPayload(), id: reviewId });
        setReviewId((updated as any)?.id ?? reviewId);
        setIsSavedDraft(true);
        alert("Đã cập nhật nháp");
      } else {
        const created = await createMut.mutateAsync(buildPayload());
        setReviewId((created as any)?.id ?? null);
        setIsSavedDraft(true);
        alert("Đã lưu nháp (mới)");
      }
    } catch (e: any) {
      alert(e?.message || "Lưu thất bại");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!reviewId) {
        const created = await createMut.mutateAsync(buildPayload());
        setReviewId((created as any)?.id ?? null);
      }
      if (!reviewId) return alert("Không có reviewId để submit");
      await submitMut.mutateAsync(reviewId);
      alert("Submit thành công");
    } catch (e: any) {
      alert(e?.message || "Submit thất bại");
    }
  };

  const computedOverall = useMemo(() => {
    const chosen = rows.filter((r) => typeof r.score === "number" && r.score !== "");
    if (!chosen.length) return null;
    const sum = chosen.reduce((s, c) => s + Number(c.score || 0), 0);
    const avg = Math.round((sum / chosen.length) * 100) / 100;
    const scale10 = Math.round((avg / 10) * 10) / 10;
    return { raw: avg, scaled10: scale10 };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Đánh giá #{assignmentId}</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSaveDraft}>Lưu nháp</Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            disabled={!isSavedDraft}
          >
            Gửi đánh giá
          </Button>
        </div>
      </div>

      {/* tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Nhận xét tổng quát</label>
          <Textarea
            value={overallComment}
            onChange={(e) => { setOverallComment(e.target.value); setIsSavedDraft(false); }}
            rows={3}
          />
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Recommendation</div>
          <div className="flex flex-col gap-2">
            {RECOMMENDATIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                className={clsx(
                  "py-2 px-3 rounded text-sm border",
                  recommendation === r.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white hover:bg-slate-50"
                )}
                onClick={() => { setRecommendation(r.key); setIsSavedDraft(false); }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* danh sách tiêu chí */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tiêu chí đánh giá</h2>
        {rows.map((r) => {
          const meta = criteriaList.find((c: any) => c.id === r.criteriaId) ?? {};
          return (
            <div key={r.criteriaId} className="border rounded p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{meta.name ?? `Tiêu chí ${r.criteriaId}`}</div>
                  <div className="text-sm text-muted-foreground">{meta.description ?? ""}</div>
                </div>
                <div className="text-right text-sm">
                  {r.choice ? CHOICES.find((c) => c.key === r.choice)?.label : "--"}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
                {CHOICES.map((c) => {
                  const sel = r.choice === c.key;
                  return (
                    <label
                      key={c.key}
                      className={clsx(
                        "cursor-pointer rounded border p-2",
                        sel ? "bg-indigo-50 border-indigo-300" : "hover:shadow-sm"
                      )}
                      onClick={() => setChoice(r.criteriaId, c.key)}
                    >
                      <div className="font-semibold">{c.label}</div>
                      {/* <div className="text-xs">{c.sub}</div> */}
                    </label>
                  );
                })}
              </div>
              <div className="mt-2">
                <Textarea
                  value={r.comment ?? ""}
                  onChange={(e) => setComment(r.criteriaId, e.target.value)}
                  rows={2}
                  placeholder="Ghi chú cho tiêu chí..."
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* preview overall */}
      <div className="text-right text-sm text-muted-foreground">
        Tổng điểm: {computedOverall ? `${computedOverall.scaled10}/10 (${computedOverall.raw}/100)` : "--"}
      </div>
    </div>
  );
}
