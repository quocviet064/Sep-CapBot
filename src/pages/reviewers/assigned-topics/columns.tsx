// src/pages/reviewers/assigned-topics/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Eye } from "lucide-react";
import type {
  ReviewerAssignmentResponseDTO,
  IdLike,
} from "@/services/reviewerAssignmentService";

const statusLabel = (s?: unknown) => {
  const k = typeof s === "string" ? s : String(s ?? "");
  switch (k) {
    case "Assigned":
      return "Đã phân công";
    case "InProgress":
      return "Đang đánh giá";
    case "Completed":
      return "Hoàn thành";
    case "Overdue":
      return "Quá hạn";
    default:
      return "--";
  }
};

const typeLabel = (t?: unknown) => {
  const k = typeof t === "string" ? t : String(t ?? "");
  switch (k) {
    case "Primary":
      return "Primary";
    case "Secondary":
      return "Secondary";
    case "Additional":
      return "Additional";
    default:
      return "--";
  }
};

/** Bật/tắt cột mặc định */
export const DEFAULT_VISIBILITY = {
  assignedBy: false,
  startedAt: false,
  completedAt: false,
  submissionTitle: true,
  topicTitle: true,
  assignedAt: true,
  deadline: true,
} as const;

export type ColumnHandlers = {
  onViewSubmission: (submissionId: IdLike) => void;
  onOpenReview: (row: ReviewerAssignmentResponseDTO) => void;
  onWithdrawReview: (row: ReviewerAssignmentResponseDTO) => void;
  canWithdrawFromStatus: (status: unknown) => boolean;
};

export function createColumns(
  handlers: ColumnHandlers
): ColumnDef<ReviewerAssignmentResponseDTO>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
          className="mb-2"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
          className="mb-2"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      meta: { title: "Mã phân công" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã phân công" />
      ),
    },
    {
      accessorKey: "submissionId",
      meta: { title: "Submission" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submission" />
      ),
    },
    {
      id: "title",
      meta: { title: "Đề tài" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đề tài" />
      ),
      cell: ({ row }) =>
        row.original.topicTitle?.trim() ||
        row.original.submissionTitle?.trim() ||
        "--",
    },
    {
      accessorKey: "assignmentType",
      meta: { title: "Loại" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loại" />
      ),
      cell: ({ row }) => typeLabel(row.original.assignmentType),
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => statusLabel(row.original.status),
    },
    {
      accessorKey: "assignedAt",
      meta: { title: "Ngày phân công" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày phân công" />
      ),
      cell: ({ row }) =>
        row.original.assignedAt ? (
          <DataTableDate date={row.original.assignedAt} />
        ) : (
          "--"
        ),
    },
    {
      accessorKey: "deadline",
      meta: { title: "Deadline" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deadline" />
      ),
      cell: ({ row }) =>
        row.original.deadline ? (
          <DataTableDate date={row.original.deadline} />
        ) : (
          "--"
        ),
    },
    {
      id: "actions",
      header: () => (
        <span className="flex items-center justify-center">Thao tác</span>
      ),
      cell: ({ row }) => {
        const a = row.original as any;

        // enriched review fields
        const reviewStatus = (a.reviewStatus ?? a.review?.status) as string | null;
        const reviewId = a.reviewId ?? a.review?.id ?? null;
        const statusKey = String(a.status || "");
        const canEvaluateByAssignment = statusKey === "Assigned";
        const canWithdrawByAssignment = handlers.canWithdrawFromStatus(statusKey);

        return (
          <div className="flex items-center justify-center gap-2">
            {/* Nút xem chi tiết submission */}
            <button
              title="Xem chi tiết submission"
              onClick={() => handlers.onViewSubmission(a.submissionId)}
              className="p-2 rounded-md hover:bg-slate-100"
            >
              <Eye className="h-4 w-4 text-slate-700" />
            </button>

            {reviewStatus === "Draft" ? (
              <>
                <button
                  title="Chỉnh sửa bản nháp"
                  onClick={() => handlers.onOpenReview(a, reviewId)}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:opacity-90"
                >
                  Chỉnh sửa
                </button>

                <button
                  title={
                    canWithdrawByAssignment
                      ? "Rút lại đánh giá"
                      : "Không thể rút ở trạng thái này"
                  }
                  onClick={() => handlers.onWithdrawReview(a)}
                  disabled={!canWithdrawByAssignment}
                  className={`px-2 py-1 rounded-md text-sm ${
                    canWithdrawByAssignment
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Rút
                </button>
              </>
            ) : reviewStatus === "Submitted" ? (
              <>
                <button
                  title="Xem chi tiết đánh giá (đã gửi)"
                  onClick={() => handlers.onOpenReview(a, reviewId)}
                  className="px-3 py-1 rounded-md border text-sm hover:bg-slate-50"
                >
                  Xem
                </button>

                <button
                  title="Rút lại đánh giá"
                  onClick={() => handlers.onWithdrawReview(a)}
                  className="px-2 py-1 rounded-md bg-red-600 text-white text-sm"
                >
                  Rút
                </button>
              </>
            ) : (
              <>
                <button
                  title={
                    canEvaluateByAssignment
                      ? "Mở trang đánh giá"
                      : "Không thể đánh giá với trạng thái hiện tại"
                  }
                  onClick={() => handlers.onOpenReview(a)}
                  disabled={!canEvaluateByAssignment}
                  className={`px-3 py-1 rounded-md text-sm ${
                    canEvaluateByAssignment
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Đánh giá
                </button>
              </>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
