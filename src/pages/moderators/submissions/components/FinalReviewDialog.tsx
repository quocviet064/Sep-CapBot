import { useState, useEffect } from "react";
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

type Decision = "approve" | "revision" | "reject" | "";

export default function FinalReviewDialog({
  isOpen,
  onClose,
  submissionId,
  onSuccess,
}: Props) {
  const [decision, setDecision] = useState<Decision>("");
  const [notes, setNotes] = useState<string>("");
  const [revisionDeadline, setRevisionDeadline] = useState<string>(""); // yyyy-mm-dd

  // derived score from decision
  const scoreFor = (d: Decision) => {
    if (d === "approve") return 10;
    if (d === "revision") return 5;
    if (d === "reject") return 0;
    return undefined;
  };

  useEffect(() => {
    if (!isOpen) {
      setDecision("");
      setNotes("");
      setRevisionDeadline("");
    }
  }, [isOpen]);

  const mut = useMutation({
    mutationFn: async (payload: any) =>
      moderatorFinalReview(payload as any),
    onSuccess: () => {
      toast.success("Đã lưu quyết định của Moderator");
      onClose();
      onSuccess?.();
    },
    onError: (err: any) => {
      const msg = (err?.response?.data?.message as string) ?? (err?.message as string) ?? "Lỗi khi gửi quyết định";
      toast.error(msg);
    },
  });

  function mapDecisionToNumber(d: Decision): 1 | 2 | 4 {
    if (d === "approve") return 1; // approve
    if (d === "revision") return 2; // minor/major combined -> use 2
    return 4; // reject
  }

  const handleSubmit = async () => {
    if (!decision) {
      toast.error("Vui lòng chọn kết luận trước khi xác nhận.");
      return;
    }

    if (decision === "revision" && !revisionDeadline) {
      toast.error("Vui lòng chọn deadline cho revision.");
      return;
    }

    const finalScore = scoreFor(decision);
    const payload: any = {
      submissionId,
      finalRecommendation: mapDecisionToNumber(decision),
      finalScore,
      moderatorNotes: notes || undefined,
    };

    if (decision === "revision") {
      try {
        const iso = new Date(revisionDeadline);
        if (Number.isNaN(iso.getTime())) {
          toast.error("Deadline không hợp lệ");
          return;
        }
        payload.revisionDeadline = iso.toISOString();
      } catch {
        toast.error("Deadline không hợp lệ");
        return;
      }
    }

    mut.mutate(payload);
  };

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
            <label className="block text-sm font-medium mb-2">Kết luận</label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="final-decision"
                  value="approve"
                  checked={decision === "approve"}
                  onChange={() => setDecision("approve")}
                />
                <span className="ml-1">Approve (Duyệt)</span>
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="final-decision"
                  value="revision"
                  checked={decision === "revision"}
                  onChange={() => setDecision("revision")}
                />
                <span className="ml-1">Revision (Sửa — minor/major gộp)</span>
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="final-decision"
                  value="reject"
                  checked={decision === "reject"}
                  onChange={() => setDecision("reject")}
                />
                <span className="ml-1">Reject (Từ chối)</span>
              </label>
            </div>
          </div>

          {decision === "revision" && (
            <div>
              <label className="block text-sm font-medium mb-1">Revision deadline (bắt buộc)</label>
              <input
                type="date"
                value={revisionDeadline}
                onChange={(e) => setRevisionDeadline(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <div className="text-xs text-slate-500 mt-1">
                Chọn deadline để người nộp sửa bài.
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú của Moderator (tuỳ chọn)</label>
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
                handleSubmit();
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
