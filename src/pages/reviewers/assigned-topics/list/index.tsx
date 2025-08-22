import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Input } from "@/components/globals/atoms/input";
import LoadingPage from "@/pages/loading-page";
import { toast } from "sonner";

import { useMyAssignments } from "@/hooks/useReviewerAssignment";
import {
  AssignmentStatus,
  type ReviewerAssignmentResponseDTO,
} from "@/services/reviewerAssignmentService";

import { createColumns, DEFAULT_VISIBILITY as COL_VIS } from "../columns";

const DEFAULT_VISIBILITY = COL_VIS;

export default function ReviewerAssignedList() {
  const navigate = useNavigate();

  // Lấy assignments reviewer đang đăng nhập
  const { data, isLoading, error } = useMyAssignments();
  const assignments = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handlers = useMemo(
    () => ({
      onViewSubmission: (submissionId: number | string) => {
        if (!submissionId) {
          toast.info("Không tìm thấy submission để xem chi tiết");
          return;
        }
        navigate(`/reviewers/assigned-topics/detail?submissionId=${submissionId}`);
      },
      onOpenReview: (row: ReviewerAssignmentResponseDTO) => {
        const id = Number(row.id);
        if (!Number.isFinite(id)) {
          toast.error("Mã phân công không hợp lệ");
          return;
        }
        navigate(`/reviewers/evaluate-topics/review?assignmentId=${id}`);
      },
    }),
    [navigate]
  );

  const columns = useMemo(() => createColumns(handlers), [handlers]);

  const filtered: ReviewerAssignmentResponseDTO[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((x) => {
      const okStatus = statusFilter === "all" ? true : String(x.status) === statusFilter;
      if (!okStatus) return false;
      if (!q) return true;
      const haystack = `${x.id} ${x.submissionId} ${x.submissionTitle ?? ""} ${x.topicTitle ?? ""}`.toLowerCase();
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
        visibility={DEFAULT_VISIBILITY as any}
        search={search}
        setSearch={setSearch}
        placeholder="Tìm theo đề tài, submission..."
      />
    </div>
  );
}
