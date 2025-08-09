import { ColumnDef } from "@tanstack/react-table";
import {
  AvailableReviewerDTO,
  ReviewerAssignmentResponseDTO,
  AssignmentStatus,
} from "@/services/reviewerAssignmentService";
import { Button } from "@/components/globals/atoms/button";

export type AvailableHandlers = {
  onAssign: (reviewerId: number) => void;
};
export type AssignmentHandlers = {
  onUpdateStatus: (assignmentId: number, status: AssignmentStatus) => void;
  onCancel: (assignmentId: number) => void;
};

/** Cột cho bảng reviewer có thể assign */
export const createAvailableColumns = (
  handlers: AvailableHandlers
): ColumnDef<AvailableReviewerDTO>[] => [
  {
    accessorKey: "id",
    header: "ID Reviewer",
  },
  {
    accessorKey: "userName",
    header: "Tên",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "currentAssignments",
    header: "Đang review",
  },
  {
    accessorKey: "skillMatchScore",
    header: "Match Score",
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => (
      <Button size="sm" onClick={() => handlers.onAssign(row.original.id)}>
        Assign
      </Button>
    ),
  },
];

/** Cột cho bảng assignments hiện tại */
export const createAssignmentColumns = (
  handlers: AssignmentHandlers
): ColumnDef<ReviewerAssignmentResponseDTO>[] => [
  {
    accessorKey: "id",
    header: "ID Assign",
  },
  {
    accessorKey: "reviewerId",
    header: "Reviewer ID",
  },
  {
    accessorKey: "assignmentType",
    header: "Type",
    cell: ({ row }) => row.original.assignmentType,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status,
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            handlers.onUpdateStatus(row.original.id, AssignmentStatus.Completed)
          }
        >
          Hoàn thành
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handlers.onCancel(row.original.id)}
        >
          Hủy
        </Button>
      </div>
    ),
  },
];
