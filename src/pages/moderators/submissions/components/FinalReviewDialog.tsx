import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import { Button } from "@/components/globals/atoms/button";
import { toast } from "sonner";
import { moderatorFinalReview } from "@/services/submissionReviewService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number | string;
  onSuccess?: () => void;
};

export default function FinalReviewDialog({
  isOpen,
  onClose,
  submissionId,
  onSuccess,
}: Props) {
  const [decision, setDecision] = useState<string>("");
  const [finalScore, setFinalScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setDecision("");
      setNotes("");
      setFinalScore("");
    }
  }, [isOpen]);

  const mut = useMutation({
    mutationFn: async () =>
      moderatorFinalReview({
        submissionId,
        finalRecommendation: mapDecisionToNumber(decision),
        finalScore: finalScore ? Number(finalScore) : undefined,
        moderatorNotes: notes,
        revisionDeadline: undefined,
      } as any),
    onSuccess: () => {
      toast.success("Đã lưu quyết định của Moderator");
      onClose();
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = (err?.message as string) ?? "Lỗi khi gửi quyết định";
      toast.error(msg);
    },
  });

  function mapDecisionToNumber(d: string): 1 | 2 | 3 | 4 {
    const v = (d ?? "").toLowerCase();
    if (v === "approve" || v === "duyệt") return 1;
    if (v === "minor" || v === "sửa nhẹ") return 2;
    if (v === "major" || v === "sửa lớn") return 3;
    if (v === "reject" || v === "từ chối") return 4;
    return 4;
  }

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!mut.isLoading) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quyết định cuối cùng của Moderator</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 pb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kết luận</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="">— Chọn quyết định —</option>
              <option value="approve">Duyệt (Approve)</option>
              <option value="minor">Sửa nhẹ (Minor revision)</option>
              <option value="major">Sửa lớn (Major revision)</option>
              <option value="reject">Từ chối (Reject)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Điểm cuối (tùy chọn)
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={100}
              placeholder="Nhập điểm cuối hoặc để trống"
              value={finalScore}
              onChange={(e) => setFinalScore(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
            <div className="text-xs text-slate-500 mt-1">
              Có thể để trống nếu không cần nhập điểm.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Ghi chú của Moderator
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú (ví dụ: cần sửa phần phương pháp, ...)"
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!mut.isLoading) onClose();
              }}
              disabled={mut.isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (!decision) {
                  toast.error("Vui lòng chọn kết luận trước khi xác nhận.");
                  return;
                }
                mut.mutate();
              }}
              disabled={mut.isLoading}
            >
              {mut.isLoading ? "Đang gửi..." : "Xác nhận quyết định"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
