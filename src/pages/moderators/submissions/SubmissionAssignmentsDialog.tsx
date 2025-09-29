import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/globals/atoms/dialog";
import LoadingPage from "@/pages/loading-page";
import { DataTable } from "@/components/globals/atoms/data-table";
import {
  useAssignmentsBySubmission,
  useCancelAssignment,
} from "@/hooks/useReviewerAssignment";
import type {
  IdLike,
  ReviewerAssignmentResponseDTO,
} from "@/services/reviewerAssignmentService";
import { createAssignmentColumns } from "./assignment-columns";
import { useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ASSIGNMENT_VISIBILITY = {
  assignedBy: false,
  deadline: true,
  startedAt: false,
  completedAt: false,
  status: false,
  assignmentType: true,
  assignedAt: true,
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  submissionId?: IdLike;
};

export default function SubmissionAssignmentsDialog({
  isOpen,
  onClose,
  submissionId,
}: Props) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useAssignmentsBySubmission(submissionId);
  const delMut = useCancelAssignment();

  const handlers = useMemo(
    () => ({
      onCancel: (assignmentId: IdLike) => {
        // Confirm before delete
        const ok = window.confirm("Bạn có chắc muốn huỷ phân công này không? Hành động này không thể hoàn tác.");
        if (!ok) return;

        delMut.mutate(assignmentId, {
          onSuccess: () => {
            toast.success("Đã huỷ phân công");
            // invalidate related queries so UI updates
            try {
              // try to normalize submissionId to number if possible
              const sidNum = submissionId ? Number(submissionId as any) : NaN;
              if (!Number.isNaN(sidNum)) {
                qc.invalidateQueries({ queryKey: ["assignments", sidNum] });
                qc.invalidateQueries({ queryKey: ["submission-detail", sidNum] });
                qc.invalidateQueries({ queryKey: ["submission-review-summary", sidNum] });
              }
              // also invalidate generic assignments list
              qc.invalidateQueries({ queryKey: ["assignments"] });
            } catch (e) {
              // ignore invalidation errors but log if needed
              // console.warn("Invalidate after cancel assignment failed", e);
            }
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message ?? err?.message ?? "Không thể huỷ phân công";
            toast.error(msg);
          },
        });
      },
    }),
    [delMut, qc, submissionId]
  );

  const columns = useMemo(() => createAssignmentColumns(handlers), [handlers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[960px]">
        <DialogHeader>
          <DialogTitle>
            Reviewers đã phân công{" "}
            {submissionId ? `— Submission #${submissionId}` : ""}
          </DialogTitle>
        </DialogHeader>

        {!submissionId ? (
          <div className="p-2 text-sm text-gray-500">Chưa chọn submission.</div>
        ) : isLoading ? (
          <LoadingPage />
        ) : error ? (
          <div className="rounded-md border p-4 text-sm text-red-600">
            Không thể tải danh sách reviewer đã phân công.
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-md border p-6 text-sm text-gray-500">
            Chưa có reviewer nào được phân công cho submission #
            {String(submissionId)}.
          </div>
        ) : (
          <DataTable<ReviewerAssignmentResponseDTO, unknown>
            data={data ?? []}
            columns={columns}
            visibility={ASSIGNMENT_VISIBILITY as any}
            placeholder="Không có dữ liệu"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
