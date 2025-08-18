import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Input } from "@/components/globals/atoms/input";
import LoadingPage from "@/pages/loading-page";
import { toast } from "sonner";

import { useAssignmentsByReviewer } from "@/hooks/useReviewerAssignment";
import {
  AssignmentStatus,
  type ReviewerAssignmentResponseDTO,
} from "@/services/reviewerAssignmentService";

import { createColumns } from "../columns";
import ReviewEditorDialog from "../review-editor/ReviewEditorDialog";

const DEFAULT_VISIBILITY = {
  assignedBy: false,
  startedAt: false,
  completedAt: false,
  submissionTitle: true,
  topicTitle: true,
  assignedAt: true,
  deadline: true,
};

export default function ReviewerAssignedList() {
  const navigate = useNavigate();

  // Lấy assignments cho reviewer hiện tại (id lấy từ JWT trong hook)
  const { data, isLoading, error } = useAssignmentsByReviewer();
  const assignments = data ?? [];

  // Local UI state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog chấm điểm
  const [openReview, setOpenReview] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | undefined>(undefined);

  // Handlers cho cột Thao tác
  const handlers = useMemo(
    () => ({
      onViewSubmission: (submissionId: number | string) => {
        if (!submissionId) {
          toast.info("Không tìm thấy submission để xem chi tiết");
          return;
        }
        navigate(`/reviewers/assigned-topics/detail?submissionId=${submissionId}`);
      },
      onReview: (assignmentId: number | string) => {
        const n = Number(assignmentId);
        if (!Number.isFinite(n)) {
          toast.error("Mã phân công không hợp lệ");
          return;
        }
        setEditingAssignmentId(n);
        setOpenReview(true);
      },
    }),
    [navigate]
  );

  // Cột bảng
  const columns = useMemo(() => createColumns(handlers), [handlers]);

  // Lọc client theo trạng thái & từ khoá
  const filtered: ReviewerAssignmentResponseDTO[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((x) => {
      const okStatus = statusFilter === "all" ? true : String(x.status) === statusFilter;
      if (!okStatus) return false;

      if (!q) return true;
      const haystack = `${x.id} ${x.submissionId} ${x.reviewerId} ${x.submissionTitle ?? ""} ${x.topicTitle ?? ""}`
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [assignments, search, statusFilter]);

  if (isLoading) return <LoadingPage />;
  if (error) return <div className="p-6 text-red-600">Lỗi tải danh sách: {error.message}</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <label htmlFor="assignSearch" className="block text-sm mb-1">
            Tìm kiếm
          </label>
          <Input
            id="assignSearch"
            placeholder="Mã phân công / submission / tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="statusFilter" className="block text-sm mb-1">
            Trạng thái
          </label>
          <select
            id="statusFilter"
            className="rounded border px-2 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc trạng thái"
          >
            <option value="all">Tất cả</option>
            <option value={AssignmentStatus.Assigned}>Đã phân công</option>
            <option value={AssignmentStatus.InProgress}>Đang đánh giá</option>
            <option value={AssignmentStatus.Completed}>Hoàn thành</option>
            <option value={AssignmentStatus.Overdue}>Quá hạn</option>
          </select>
        </div>
      </div>

      <DataTable<ReviewerAssignmentResponseDTO, unknown>
        data={filtered}
        columns={columns as any}
        visibility={DEFAULT_VISIBILITY}
        search={search}
        setSearch={setSearch}
        placeholder="Tìm theo đề tài, submission..."
      />

      <ReviewEditorDialog
        isOpen={openReview}
        onClose={() => setOpenReview(false)}
        assignmentId={editingAssignmentId}
      />
    </div>
  );
}
