import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Button } from "@/components/globals/atoms/button";
import { Input } from "@/components/globals/atoms/input";
import { Textarea } from "@/components/globals/atoms/textarea";
import LoadingPage from "@/pages/loading-page";
import { toast } from "sonner";

// Hooks + types từ reviewService (đã có sẵn)
import {
  useReviewsByAssignment,
  useReviewDetail,
  useCreateReview,
  useUpdateReview,
  useSubmitReview,
} from "@/hooks/useReview";

import type {
  ReviewDTO,
  ReviewCriteriaScoreDTO,
  IdLike,
} from "@/services/reviewService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assignmentId?: number;
}

type Row = {
  criteriaId: number;
  name: string;
  maxScore: number;
  weight: number;
  score: number | "";
  comment: string;
};

export default function ReviewEditorDialog({
  isOpen,
  onClose,
  assignmentId,
}: Props) {
  // 1) Load list reviews theo assignment (để chọn Draft / bản mới nhất)
  const {
    data: listByAssignment,
    isLoading: listLoading,
    error: listError,
  } = useReviewsByAssignment(assignmentId);

  // Ưu tiên bản Draft; nếu không có thì lấy bản mới nhất theo updatedAt/createdAt
  const chosenReviewId: IdLike | undefined = useMemo(() => {
    const list = listByAssignment ?? [];
    if (!list.length) return undefined;

    const draft = list.find((r) => (r.status ?? "").toLowerCase() === "draft");
    if (draft) return draft.id;

    const sorted = [...list].sort((a, b) => {
      const da = Date.parse(a.updatedAt ?? a.createdAt ?? "1970-01-01");
      const db = Date.parse(b.updatedAt ?? b.createdAt ?? "1970-01-01");
      return db - da;
    });
    return sorted[0]?.id;
  }, [listByAssignment]);

  // 2) Nếu đã có review được chọn -> lấy chi tiết
  const {
    data: detail,
    isLoading: detailLoading,
  } = useReviewDetail(chosenReviewId);

  // 3) Mutations
  const createMut = useCreateReview();
  const updateMut = useUpdateReview();
  const submitMut = useSubmitReview();

  // 4) Form state
  const [reviewId, setReviewId] = useState<IdLike | undefined>(undefined);
  const [overallScore, setOverallScore] = useState<number | "">("");
  const [overallComment, setOverallComment] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("Draft");

  useEffect(() => {
    if (!detail) {
      setReviewId(undefined);
      setOverallScore("");
      setOverallComment("");
      setRows([]);
      setStatus("Draft");
      return;
    }
    setReviewId(detail.id);
    setOverallScore(detail.overallScore ?? "");
    setOverallComment(detail.overallComment ?? "");
    setStatus(detail.status ?? "Draft");

    const mapped: Row[] = (detail.criteriaScores ?? []).map((cs) => ({
      criteriaId: cs.criteriaId,
      name: cs.criteria?.name ?? `Criteria #${cs.criteriaId}`,
      maxScore: cs.criteria?.maxScore ?? 10,
      weight: cs.criteria?.weight ?? 1,
      score: typeof cs.score === "number" ? cs.score : "",
      comment: cs.comment ?? "",
    }));
    setRows(mapped);
  }, [detail]);

  const canCreateDraft = (listByAssignment?.length ?? 0) === 0 && !!assignmentId;
  const isSubmitted = (status ?? "").toLowerCase() === "submitted";
  const loading = listLoading || (chosenReviewId && detailLoading);

  // 5) Handlers
  const handleCreateDraft = async () => {
    if (!assignmentId) return;
    try {
      const created = await createMut.mutateAsync({
        assignmentId,
        overallScore: null,
        overallComment: "",
        // để BE tự gắn rubric/criteria; nếu BE yêu cầu gửi đủ, map theo rubric ở client trước khi call
        criteriaScores: [],
      });
      toast.success("Đã tạo review nháp");
      // Sau khi invalidate trong hook, dialog sẽ tự re-render và lấy detail mới
    } catch (e: any) {
      toast.error(e?.message || "Không tạo được review nháp");
    }
  };

  const validateScores = (rws: Row[]) => {
    for (const r of rws) {
      if (r.score === "") continue;
      if (typeof r.score === "number" && r.score > r.maxScore) {
        throw new Error(`Điểm "${r.name}" vượt tối đa ${r.maxScore}`);
      }
      if (typeof r.score === "number" && r.score < 0) {
        throw new Error(`Điểm "${r.name}" không được âm`);
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!reviewId || !detail) return;
    try {
      validateScores(rows);
      const payload = {
        id: reviewId,
        assignmentId: detail.assignmentId,
        overallScore: typeof overallScore === "number" ? overallScore : null,
        overallComment: overallComment || null,
        criteriaScores: rows.map<ReviewCriteriaScoreDTO>((r) => ({
          criteriaId: r.criteriaId,
          score: typeof r.score === "number" ? r.score : 0,
          comment: r.comment || null,
        })),
      };
      await updateMut.mutateAsync(payload);
      toast.success("Đã lưu bản nháp");
    } catch (e: any) {
      toast.error(e?.message || "Lưu không thành công");
    }
  };

  const handleSubmit = async () => {
    if (!reviewId) return;
    try {
      // Auto-save trước
      await handleSaveDraft();
      await submitMut.mutateAsync(reviewId);
      toast.success("Đã submit đánh giá");
      onClose();
    } catch (e: any) {
      // toast đã bắn trong service/hook; để thêm đảm bảo UX:
      if (e?.message) toast.error(e.message);
    }
  };

  const onChangeScore = (idx: number, v: string) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx] };
      if (v === "") row.score = "";
      else {
        const num = Number(v);
        row.score = Number.isFinite(num) ? num : row.score;
      }
      next[idx] = row;
      return next;
    });
  };

  const onChangeComment = (idx: number, v: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], comment: v };
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-[1100px] max-h-[92vh] p-0 overflow-hidden">
        <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <DialogHeader>
            <DialogTitle>Đánh giá đề tài</DialogTitle>
            <DialogDescription>
              {assignmentId ? `Assignment #${assignmentId}` : "Thiếu Assignment"}
              {isSubmitted && " — (ĐÃ SUBMIT)"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <LoadingPage />
          ) : listError ? (
            <div className="text-red-600">
              Không tải được danh sách review: {(listError as any)?.message || ""}
            </div>
          ) : canCreateDraft ? (
            <div className="rounded-md border p-4">
              <p className="mb-3 text-sm text-gray-600">
                Chưa có review nào cho assignment này. Tạo bản nháp để bắt đầu chấm.
              </p>
              <Button onClick={handleCreateDraft} disabled={createMut.isPending}>
                {createMut.isPending ? "Đang tạo..." : "Tạo review nháp"}
              </Button>
            </div>
          ) : !detail ? (
            <div className="text-sm text-gray-600">Không tìm thấy chi tiết review.</div>
          ) : (
            <>
              {/* Tổng quan */}
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Điểm tổng</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={overallScore}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") setOverallScore("");
                      else {
                        const n = Number(v);
                        if (Number.isFinite(n)) setOverallScore(n);
                      }
                    }}
                    disabled={isSubmitted || updateMut.isPending || submitMut.isPending}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm">Nhận xét chung</label>
                  <Textarea
                    rows={3}
                    value={overallComment}
                    onChange={(e) => setOverallComment(e.target.value)}
                    placeholder="Nhận xét tổng quan…"
                    disabled={isSubmitted || updateMut.isPending || submitMut.isPending}
                  />
                </div>
              </div>

              {/* Bảng tiêu chí */}
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left">Tiêu chí</th>
                      <th className="p-2 text-right">Tối đa</th>
                      <th className="p-2 text-right">Trọng số</th>
                      <th className="p-2 text-right">Điểm</th>
                      <th className="p-2 text-left">Nhận xét</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-gray-500">
                          Chưa có danh mục tiêu chí. Vui lòng tạo draft hoặc kiểm tra cấu hình rubric.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r, idx) => (
                        <tr key={r.criteriaId} className="border-t">
                          <td className="p-2">{r.name}</td>
                          <td className="p-2 text-right">{r.maxScore}</td>
                          <td className="p-2 text-right">{r.weight}</td>
                          <td className="p-2">
                            <Input
                              className="text-right"
                              type="number"
                              min={0}
                              step="0.1"
                              value={r.score}
                              onChange={(e) => onChangeScore(idx, e.target.value)}
                              disabled={isSubmitted || updateMut.isPending || submitMut.isPending}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={r.comment}
                              onChange={(e) => onChangeComment(idx, e.target.value)}
                              placeholder="Nhận xét ngắn…"
                              disabled={isSubmitted || updateMut.isPending || submitMut.isPending}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 z-10 border-t bg-white px-6 py-4">
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {!isSubmitted && detail && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleSaveDraft}
                  disabled={updateMut.isPending || submitMut.isPending}
                >
                  {updateMut.isPending ? "Đang lưu..." : "Lưu nháp"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitMut.isPending || updateMut.isPending}
                >
                  {submitMut.isPending ? "Đang submit..." : "Submit đánh giá"}
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
