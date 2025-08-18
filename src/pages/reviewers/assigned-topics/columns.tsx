import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Eye } from "lucide-react";
import {
  AssignmentStatus,
  AssignmentTypes,
  type ReviewerAssignmentResponseDTO,
  type IdLike,
} from "@/services/reviewerAssignmentService";

const statusLabel = (s?: number) => {
  switch (s) {
    case AssignmentStatus.Assigned:
      return "Đã phân công";
    case AssignmentStatus.InProgress:
      return "Đang đánh giá";
    case AssignmentStatus.Completed:
      return "Hoàn thành";
    case AssignmentStatus.Overdue:
      return "Quá hạn";
    default:
      return "--";
  }
};

const typeLabel = (t?: number) => {
  switch (t) {
    case AssignmentTypes.Primary:
      return "Primary";
    case AssignmentTypes.Secondary:
      return "Secondary";
    case AssignmentTypes.Additional:
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
      cell: ({ row }) => typeLabel(row.original.assignmentType as number),
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => statusLabel(row.original.status as number),
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
        const a = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handlers.onViewSubmission(a.submissionId)}
              title="Xem submission"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => handlers.onOpenReview(a)}>
              Đánh giá
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
