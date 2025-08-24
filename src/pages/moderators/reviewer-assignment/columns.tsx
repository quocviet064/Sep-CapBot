import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/globals/atoms/button";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import {
  AssignmentStatus,
  AssignmentTypes,
  type IdLike,
  type AvailableReviewerDTO,
  type ReviewerAssignmentResponseDTO,
} from "@/services/reviewerAssignmentService";

const statusLabel = (s?: number) => {
  switch (s) {
    case AssignmentStatus.Assigned: return "Đã phân công";
    case AssignmentStatus.InProgress: return "Đang đánh giá";
    case AssignmentStatus.Completed: return "Hoàn thành";
    case AssignmentStatus.Overdue: return "Quá hạn";
    default: return "--";
  }
};

const typeLabel = (t?: number) => {
  switch (t) {
    case AssignmentTypes.Primary: return "Primary";
    case AssignmentTypes.Secondary: return "Secondary";
    case AssignmentTypes.Additional: return "Additional";
    default: return "--";
  }
};

const nextStatus = (cur?: number): AssignmentStatus => {
  if (cur === AssignmentStatus.Assigned) return AssignmentStatus.InProgress;
  if (cur === AssignmentStatus.InProgress) return AssignmentStatus.Completed;
  return (cur as AssignmentStatus) ?? AssignmentStatus.InProgress;
};

/* ---------- Available reviewers columns (nếu cần dùng nơi khác) ---------- */
export type AvailableHandlers = {
  onAssign: (reviewerId: IdLike) => void;
};

export const createAvailableColumns = (
  handlers: AvailableHandlers
): ColumnDef<AvailableReviewerDTO>[] => [
  {
    accessorKey: "id",
    meta: { title: "ID Reviewer" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID Reviewer" />,
    cell: ({ row }) => String(row.original.id),
  },
  {
    accessorKey: "userName",
    meta: { title: "Tên" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
    cell: ({ row }) => row.original.userName ?? "--",
  },
  {
    accessorKey: "email",
    meta: { title: "Email" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => row.original.email ?? "--",
  },
  {
    accessorKey: "currentAssignments",
    meta: { title: "Đang review" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Đang review" />,
  },
  {
    accessorKey: "skillMatchScore",
    meta: { title: "Match" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Match" />,
    cell: ({ row }) => {
      const v = row.original.skillMatchScore;
      return typeof v === "number" ? v.toFixed(2) : "-";
    },
  },
  {
    id: "actions",
    header: () => <span className="flex items-center justify-center">Thao tác</span>,
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="flex items-center justify-center">
          <Button
            size="sm"
            onClick={() => handlers.onAssign(r.id)}
            disabled={r.isAvailable === false}
            title={r.isAvailable === false ? (r.unavailableReason || "Reviewer bận") : undefined}
          >
            Assign
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

/* ---------- Assignments columns (dùng cho bảng dưới) ---------- */
export type AssignmentHandlers = {
  onUpdateStatus: (assignmentId: IdLike, status: AssignmentStatus) => void;
  onCancel: (assignmentId: IdLike) => void;
};

export const createAssignmentColumns = (
  handlers: AssignmentHandlers
): ColumnDef<ReviewerAssignmentResponseDTO>[] => [
  {
    accessorKey: "id",
    meta: { title: "ID Assign" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID Assign" />,
  },
  {
    accessorKey: "reviewerId",
    meta: { title: "Reviewer" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Reviewer" />,
    cell: ({ row }) => {
      const r = row.original;
      return r.reviewer?.userName ? `${r.reviewer.userName} (#${r.reviewerId})` : `#${r.reviewerId}`;
    },
  },
  {
    accessorKey: "assignmentType",
    meta: { title: "Loại" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
    cell: ({ row }) => typeLabel(row.original.assignmentType),
  },
  {
    accessorKey: "status",
    meta: { title: "Trạng thái" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => statusLabel(row.original.status),
  },
  {
    accessorKey: "assignedAt",
    meta: { title: "Ngày phân công" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày phân công" />,
    cell: ({ row }) => <DataTableDate date={row.original.assignedAt} />,
  },
  {
    accessorKey: "deadline",
    meta: { title: "Deadline" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Deadline" />,
    cell: ({ row }) =>
      row.original.deadline ? <DataTableDate date={row.original.deadline} /> : "--",
  },
  {
    id: "actions",
    header: () => <span className="flex items-center justify-center">Thao tác</span>,
    cell: ({ row }) => {
      const a = row.original;
      const disabledStep =
        a.status === AssignmentStatus.Completed || a.status === AssignmentStatus.Overdue;
      return (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handlers.onUpdateStatus(a.id, nextStatus(a.status))}
            disabled={disabledStep}
          >
            Tiến bước
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handlers.onCancel(a.id)}
          >
            Hủy
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
