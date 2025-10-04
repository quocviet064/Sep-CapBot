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
  if (k.includes("assigned")) return "Được phân công";
  if (k.includes("inprogress") || k.includes("in_progress") || k.includes("in progress"))
    return "Đang đánh giá";
  if (k.includes("completed")) return "Hoàn thành";
  if (k.includes("overdue")) return "Quá hạn";
  return "--";
};

const typeLabel = (t?: unknown) => {
  // assignmentType might be numeric or string
  const k = toLower(t);
  if (!k) return "--";
  if (k === "primary" || k === "1") return "Primary";
  if (k === "secondary" || k === "2") return "Secondary";
  if (k === "additional" || k === "3") return "Additional";
  return "--";
};

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
  onOpenReview: (row: ReviewerAssignmentResponseDTO, reviewId?: IdLike) => void;
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
      cell: ({ row }) =>
        typeLabel(row.original.assignmentType ?? (row.original as any).type),
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => {
        const raw =
          (row.original as any).normalizedStatus ??
          toLower(
            row.original.status ??
            (row.original as any).assignmentStatus ??
            (row.original as any).statusName ??
            ""
          );

        if (!raw) return "--";
        const maybeNum = Number.isNaN(Number(raw)) ? null : Number(raw);
        const numericStatusMap: Record<number, string> = {
          0: "Pending",
          1: "Được phân công",
          2: "Đang đánh giá",
          3: "Hoàn thành",
          4: "Quá hạn",
          5: "Đã hủy",
        };

        if (maybeNum !== null) {
          if (numericStatusMap[maybeNum]) return numericStatusMap[maybeNum];
          return String(maybeNum);
        }
        const normalized = String(raw).toLowerCase();
        if (normalized.includes("assigned")) return "Được phân công";
        if (normalized.includes("inprogress") || normalized.includes("in_progress") || normalized.includes("in progress"))
          return "Đang đánh giá";
        if (normalized.includes("completed")) return "Hoàn thành";
        if (normalized.includes("overdue")) return "Quá hạn";
        if (normalized === "draft") return "Draft";
        if (normalized === "submitted") return "Submitted";
        if (normalized === "approved") return "Đã duyệt";
        if (normalized === "rejected") return "Từ chối";
        if (normalized === "escalatedtomoderator" || normalized.includes("escalated"))
          return "EscalatedToModerator";
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

        // reviewStatus normalized to lowercase if set in enrichedAssignments
        const reviewStatus = toLower(a.reviewStatus ?? a.review?.status);
        const reviewId = a.reviewId ?? a.review?.id ?? null;

        const statusKey =
          a.status ?? a.assignmentStatus ?? a.statusName ?? "";
        const statusKeyNorm = toLower(statusKey);

        const maybeDeadline =
          a.deadline ?? a.submissionDeadline ?? a.dueDate ?? a.submissionDueDate ?? null;
        const deadlineDate = maybeDeadline ? new Date(maybeDeadline) : null;
        const now = new Date();

        const hasAssignedStatus = statusKeyNorm.includes("assigned");
        const hasReview = !!reviewStatus;
        const deadlineInFuture = deadlineDate ? deadlineDate >= now : false;

        // Allow evaluate if assigned OR no review yet and not overdue or no status
        const canEvaluate =
          hasAssignedStatus || (!hasReview && (deadlineInFuture || !statusKeyNorm));

        const canWithdraw = handlers.canWithdrawFromStatus(statusKey);

        return (
          <div className="flex items-center justify-center gap-2">
            {/* Xem chi tiết submission */}
            <button
              title="Xem chi tiết submission"
              onClick={() => handlers.onViewSubmission(a.submissionId)}
              className="p-2 rounded-md hover:bg-slate-100"
            >
              <Eye className="h-4 w-4 text-slate-700" />
            </button>

            {reviewStatus === "draft" ? (
              <>
                <button
                  title="Chỉnh sửa bản nháp"
                  onClick={() => handlers.onOpenReview(a, reviewId)}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:opacity-90"
                >
                  Chỉnh sửa
                </button>
                <button
                  title="Rút lại đánh giá"
                  onClick={() => handlers.onWithdrawReview(a)}
                  disabled={!canWithdraw}
                  className={`px-2 py-1 rounded-md text-sm ${canWithdraw
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  Rút
                </button>
              </>
            ) : reviewStatus === "submitted" ? (
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
              <button
                title={
                  canEvaluate
                    ? "Mở trang đánh giá"
                    : "Không thể đánh giá với trạng thái hiện tại"
                }
                onClick={() => handlers.onOpenReview(a)}
                disabled={!canEvaluate}
                className={`px-3 py-1 rounded-md text-sm ${canEvaluate
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                Đánh giá
              </button>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
