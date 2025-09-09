import { useState } from "react";
import { Users } from "lucide-react";
import SubmissionTable from "../SubmissionTable";
import ReviewerPickerDialog from "../ReviewerPickerDialog";
import { useSubmissions } from "@/hooks/useSubmission";
import { useBulkAssignReviewers } from "@/hooks/useReviewerAssignment";
import type { RawSubmissionResponse } from "@/services/submissionService";
import type { BulkAssignReviewerDTO } from "@/services/reviewerAssignmentService";
import { toast } from "sonner";

export default function TabAssign() {
  // reviewer picker
  const [assignForId, setAssignForId] = useState<number | string | null>(null);

  // paging + search
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  // fetch submissions
  const query = useSubmissions({
    PageNumber: page,
    PageSize: pageSize,
    Keyword: search,
  });

  const resp: RawSubmissionResponse | undefined = query.data ?? undefined;
  const rows = resp?.listObjects ?? [];
  const totalPages = resp?.totalPages ?? 1;

  // bulk assign
  const bulkMut = useBulkAssignReviewers();

  const handleConfirmAssign = (params: { reviewerIds: (string | number)[]; assignmentType: number }) => {
    if (!assignForId) return;
    const payload: BulkAssignReviewerDTO = {
      assignments: params.reviewerIds.map((rid) => ({
        submissionId: assignForId!,
        reviewerId: rid,
        assignmentType: params.assignmentType as any,
      })),
    };
    bulkMut.mutate(payload, {
      onSuccess: (res) => {
        if (!res?.success) {
          toast.error(res?.message || "Phân công thất bại");
        } else {
          toast.success(`Đã phân công ${res.data?.length ?? 0} reviewer`);
        }
        setAssignForId(null);
      },
      onError: (e) => toast.error(e.message || "Phân công thất bại"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Phân công phản biện</h2>
            <p className="text-xs text-white/70">Chọn submission và gán reviewer phù hợp.</p>
          </div>
        </div>
      </div>

      {/* Table (dumb) */}
      <SubmissionTable
        mode="assign"
        rows={rows}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        search={search}
        setSearch={setSearch}
        onViewDetail={(id) => setAssignForId(id)}          // mở dialog trước khi assign
        onAssignReviewer={(id) => setAssignForId(id)}      // click trực tiếp "Phân công reviewer"
      />

      {/* Reviewer picker */}
      <ReviewerPickerDialog
        isOpen={assignForId != null}
        onClose={() => setAssignForId(null)}
        submissionId={assignForId ?? undefined}
        onConfirm={handleConfirmAssign}
      />
    </div>
  );
}
