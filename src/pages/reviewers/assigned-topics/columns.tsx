import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Eye } from "lucide-react";
import type {
  ReviewerAssignmentResponseDTO,
  IdLike,
} from "@/services/reviewerAssignmentService";

const normalize = (v?: unknown) => String(v ?? "").trim();
const toLower = (v?: unknown) => normalize(v).toLowerCase();

const statusLabel = (s?: unknown) => {
  const k = toLower(s);
  if (!k) return "--";
  if (k.includes("assigned")) return "Đã phân công";
  if (k.includes("inprogress") || k.includes("in_progress") || k.includes("in progress")) return "Đang đánh giá";
  if (k.includes("completed")) return "Hoàn thành";
  if (k.includes("overdue")) return "Quá hạn";
  return "--";
};

const typeLabel = (t?: unknown) => {
  const k = toLower(t);
  switch (k) {
    case "primary":
      return "Primary";
    case "secondary":
      return "Secondary";
    case "additional":
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
      cell: ({ row }) => typeLabel(row.original.assignmentType ?? (row.original as any).type),
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => {
        // tolerate different field names for status
        const s =
          row.original.status ??
          (row.original as any).assignmentStatus ??
          (row.original as any).statusName ??
          "";
        return statusLabel(s);
      },
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
      cell: ({ row }) => {
        // tolerate various deadline field names
        const d =
          row.original.deadline ??
          (row.original as any).submissionDeadline ??
          (row.original as any).dueDate ??
          (row.original as any).submissionDueDate ??
          null;
        return d ? <DataTableDate date={d} /> : "--";
      },
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

        // status detection (tolerant)
        const statusKey =
          a.status ??
          a.assignmentStatus ??
          a.statusName ??
          ""; // may be empty
        const statusKeyNorm = toLower(statusKey);

        // deadline detection
        const maybeDeadline =
          a.deadline ?? a.submissionDeadline ?? a.dueDate ?? a.submissionDueDate ?? null;
        const deadlineDate = maybeDeadline ? new Date(maybeDeadline) : null;
        const now = new Date();

        const hasAssignedStatus = statusKeyNorm.includes("assigned");
        const hasReview = !!reviewStatus;
        const deadlineInFuture = deadlineDate ? deadlineDate.getTime() >= now.getTime() : false;

        const canEvaluateByAssignment =
          hasAssignedStatus || (!hasReview && (deadlineInFuture || !statusKeyNorm));

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
