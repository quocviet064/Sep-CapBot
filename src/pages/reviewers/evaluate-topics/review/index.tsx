import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import { Textarea } from "@/components/globals/atoms/textarea";
import { Input } from "@/components/globals/atoms/input";
import LoadingPage from "@/pages/loading-page";
import { useActiveEvaluationCriteria } from "@/hooks/useEvaluationCriteria";
import { useCreateReview, useSubmitReview } from "@/hooks/useReview"; // ⬅️ thêm useSubmitReview
import type { IdLike, CreateReviewDTO } from "@/services/reviewService";

type RowScore = {
  criteriaId: number;
  score: number | "";
  comment?: string;
};

export default function ReviewerEvaluateTopicPage() {
  const [sp] = useSearchParams();
  const assignmentIdParam = sp.get("assignmentId") ?? "";
  const assignmentIdNum = Number(assignmentIdParam);
  const validAssignment =
    assignmentIdParam && Number.isFinite(assignmentIdNum) && assignmentIdNum > 0;

  // Bắt thời điểm vào trang để auto tính thời gian thực hiện
  const startedAtRef = useRef<number>(Date.now());
  const { data: criteria, isLoading, error } = useActiveEvaluationCriteria(true);
  const [overallComment, setOverallComment] = useState("");
  const [scores, setScores] = useState<RowScore[]>([]);

  useEffect(() => {
    if (criteria?.length) {
      setScores(criteria.map(c => ({ criteriaId: c.id, score: "", comment: "" })));
    } else {
      setScores([]);
    }
  }, [criteria]);

  const totalMax = useMemo(
    () => (criteria ?? []).reduce((s, c) => s + (c.maxScore ?? 0), 0),
    [criteria]
  );
  const totalScore = useMemo(
    () => scores.reduce((s, r) => s + (typeof r.score === "number" ? r.score : 0), 0),
    [scores]
  );

  const setScore = (criteriaId: number, raw: string) => {
    const n = raw === "" ? "" : Number(raw);
    setScores(prev => prev.map(r => (r.criteriaId === criteriaId ? { ...r, score: n } : r)));
  };
  const setComment = (criteriaId: number, comment: string) => {
    setScores(prev => prev.map(r => (r.criteriaId === criteriaId ? { ...r, comment } : r)));
  };

  const createMut = useCreateReview();
  const submitMut = useSubmitReview(); 

  const canSubmit =
    validAssignment &&
    !isLoading &&
    (criteria?.length ?? 0) > 0 &&
    scores.every(s => s.score !== "");

  const onSubmit = () => {
    if (!validAssignment || !criteria) return;

    // Validate theo max
    const bad = scores.find(s => {
      const c = criteria.find(x => x.id === s.criteriaId);
      const max = c?.maxScore ?? 0;
      const val = typeof s.score === "number" ? s.score : -1;
      return val < 0 || val > max;
    });
    if (bad) {
      alert("Có tiêu chí có điểm không hợp lệ (nhỏ hơn 0 hoặc vượt quá tối đa).");
      return;
    }

    // Tính thời gian thực hiện từ lúc mở trang đến lúc bấm lưu
    const elapsedMinutes = Math.max(
      1,
      Math.round((Date.now() - startedAtRef.current) / 60000)
    );

    const payload = {
      assignmentId: assignmentIdNum as IdLike,
      overallComment: overallComment.trim() || undefined,
      criteriaScores: scores.map(s => ({
        criteriaId: s.criteriaId,
        score: Number(s.score),
        comment: s.comment?.trim() || undefined,
      })),
      timeSpentMinutes: elapsedMinutes,
    } as unknown as CreateReviewDTO;

    createMut.mutate(payload, {
      onSuccess: (rv) => {
        submitMut.mutate(rv.id);
      },
    });
  };

  if (!validAssignment) {
    return (
      <div className="p-6 text-red-600">
        Thiếu hoặc sai <b>assignmentId</b> trên URL. Ví dụ:
        <code className="ml-2 rounded bg-muted px-2 py-1">?assignmentId=5</code>
      </div>
    );
  }

  if (isLoading) return <LoadingPage />;

  return (
    <div className="grid gap-6 p-6 md:grid-cols-[1fr,1.2fr]">
      {/* BÊN TRÁI: Thông tin submission */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold">Đánh giá Submission #{assignmentIdNum}</h1>
          <div className="text-sm text-gray-500">
            Tổng điểm: <b>{totalScore}</b> / {totalMax}
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="text-sm text-gray-600 mb-2">Thông tin đề tài</div>
          <div className="space-y-1 text-sm">
            <div><b>Tiêu đề:</b> (nạp từ API submission/topic detail)</div>
            <div><b>Giảng viên:</b> …</div>
            <div><b>File nộp:</b> …</div>
            <div><b>Ghi chú:</b> …</div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Nhận xét tổng quát</label>
          <Textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="Nhận xét tổng thể…"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || createMut.isPending || submitMut.isPending}
            title={!canSubmit ? "Điền đầy đủ điểm cho các tiêu chí" : undefined}
          >
            {createMut.isPending || submitMut.isPending ? "Đang gửi..." : "Lưu & Submit"}
          </Button>
        </div>
      </div>

      {/* BÊN PHẢI: Tiêu chí đánh giá */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Tiêu chí đánh giá</h2>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Không tải được tiêu chí: {error.message}
          </div>
        )}

        {!error && (criteria?.length ?? 0) === 0 && (
          <div className="rounded border bg-muted p-3 text-sm">
            Không có tiêu chí đánh giá đang hoạt động.
          </div>
        )}

        {(criteria?.length ?? 0) > 0 && (
          <div className="rounded-md border overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="p-2 text-left">Tiêu chí</th>
                  <th className="p-2 text-left">Mô tả</th>
                  <th className="p-2 text-right">Tối đa</th>
                  <th className="p-2 text-right">Điểm</th>
                  <th className="p-2 text-left">Nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {criteria!.map((c) => {
                  const row = scores.find(r => r.criteriaId === c.id);
                  const max = c.maxScore ?? 0;
                  return (
                    <tr key={c.id} className="border-t">
                      <td className="p-2 align-top">
                        <div className="font-medium">{c.name}</div>
                      </td>
                      <td className="p-2 align-top text-gray-600">
                        {c.description ?? "--"}
                      </td>
                      <td className="p-2 align-top text-right">{max}</td>
                      <td className="p-2 align-top">
                        <Input
                          type="number"
                          min={0}
                          max={max}
                          step="0.5"
                          className="w-28 text-right"
                          value={row?.score ?? ""}
                          onChange={(e) => setScore(c.id, e.target.value)}
                        />
                      </td>
                      <td className="p-2 align-top">
                        <Textarea
                          placeholder="Nhận xét…"
                          value={row?.comment ?? ""}
                          onChange={(e) => setComment(c.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
