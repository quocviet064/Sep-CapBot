import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Input } from "@/components/globals/atoms/input";
import LoadingPage from "@/pages/loading-page";
import { toast } from "sonner";

import { useMyAssignments, useStartReview } from "@/hooks/useReviewerAssignment";
import { useWithdrawReview } from "@/hooks/useReview";
import type { ReviewerAssignmentResponseDTO } from "@/services/reviewerAssignmentService";
import {
  getReviewsByAssignment,
  getReviewById,
} from "@/services/reviewService";

import { createColumns, DEFAULT_VISIBILITY as COL_VIS } from "../columns";

const DEFAULT_VISIBILITY = COL_VIS;

const STATUS = {
  ALL: "all",
  ASSIGNED: "Assigned",
  INPROGRESS: "InProgress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
} as const;

export default function ReviewerAssignedList() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useMyAssignments();
  const assignments = data ?? [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(STATUS.ALL);

  const startReviewMut = useStartReview();
  const withdrawMut = useWithdrawReview();

  const handlers = useMemo(
    () => ({
      onViewSubmission: (submissionId: number | string) => {
        if (!submissionId) {
          toast.info("Không tìm thấy submission để xem chi tiết");
          return;
        }
        navigate(`/reviewers/assigned-topics/detail?submissionId=${submissionId}`);
      },

      // Chỉ cho phép vào đánh giá khi status === "Assigned"
      onOpenReview: (row: ReviewerAssignmentResponseDTO) => {
        const statusKey = String(row.status || "");
        if (statusKey !== STATUS.ASSIGNED) {
          const msg =
            statusKey === STATUS.INPROGRESS
              ? "Đề tài đang ở trạng thái Đang đánh giá — tạm thời không thể mở đánh giá."
              : statusKey === STATUS.COMPLETED
              ? "Đề tài đã hoàn thành — không thể mở đánh giá."
              : "Trạng thái hiện tại không cho phép đánh giá.";
          toast.info(msg);
          return;
        }

        const id = Number(row.id);
        if (!Number.isFinite(id)) {
          toast.error("Mã phân công không hợp lệ");
          return;
        }

        startReviewMut.mutate(id, {
          onSuccess: () => {
            navigate(`/reviewers/evaluate-topics/review?assignmentId=${id}`);
          },
          onError: (e: any) => {
            toast.error(e?.message || "Không thể bắt đầu phiên đánh giá");
          },
        });
      },

      // Rút lại đánh giá: tùy theo hiện tại đã có reviewId hay chưa
      onWithdrawReview: async (row: ReviewerAssignmentResponseDTO) => {
        const statusKey = String(row.status || "");
        if (statusKey !== STATUS.INPROGRESS && statusKey !== STATUS.COMPLETED) {
          toast.info("Chỉ có thể rút khi đề tài đang/đã đánh giá.");
          return;
        }
        // 1) id có sẵn
        let ridRaw = (row as any).reviewId ?? (row as any).currentReviewId;
        let rid: number | null = ridRaw ? Number(ridRaw) : null;
        // 2) Nếu chưa có
        if (!rid) {
          try {
            const list = await getReviewsByAssignment(row.id);
            if (Array.isArray(list) && list.length > 0) {
              const submitted = list.find((r) => r.status === "Submitted");
              const pick =
                submitted ??
                [...list].sort((a, b) =>
                  String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""))
                )[0];
              rid = Number(pick.id);
            }
          } catch {
          }
        }

        if (!rid || !Number.isFinite(rid)) {
          toast.info("Chưa tìm thấy review để rút lại.");
          return;
        }

        const ok = window.confirm("Bạn có chắc muốn rút lại đánh giá này?");
        if (!ok) return;

        try {
          await getReviewById(rid);
          withdrawMut.mutate(rid);
        } catch {
        }
      },

      canWithdrawFromStatus: (status: unknown) => {
        const k = String(status || "");
        return k === STATUS.INPROGRESS || k === STATUS.COMPLETED;
      },
    }),
    [navigate, startReviewMut, withdrawMut]
  );

  const columns = useMemo(() => createColumns(handlers), [handlers]);

  const filtered: ReviewerAssignmentResponseDTO[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter((x) => {
      const statusKey = String(x.status || "");
      const okStatus = statusFilter === STATUS.ALL ? true : statusKey === statusFilter;
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
            <option value={STATUS.ALL}>Tất cả</option>
            <option value={STATUS.ASSIGNED}>Đã phân công</option>
            <option value={STATUS.INPROGRESS}>Đang đánh giá</option>
            <option value={STATUS.COMPLETED}>Hoàn thành</option>
            <option value={STATUS.OVERDUE}>Quá hạn</option>
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
