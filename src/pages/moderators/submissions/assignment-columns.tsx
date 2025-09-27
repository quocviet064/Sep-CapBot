import type { ColumnDef } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Button } from "@/components/globals/atoms/button";
import type { ReviewerAssignmentResponseDTO } from "@/services/reviewerAssignmentService";

export type AssignmentColumnHandlers = {
  onCancel: (assignmentId: number | string) => void;
};

export function createAssignmentColumns(
  handlers: AssignmentColumnHandlers
): ColumnDef<ReviewerAssignmentResponseDTO>[] {
  const cols: ColumnDef<ReviewerAssignmentResponseDTO>[] = [
    {
      accessorKey: "reviewer.fullName",
      meta: { title: "Reviewer" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reviewer" />
      ),
      cell: ({ row }) =>
        row.original.reviewer?.fullName || row.original.reviewer?.email || "—",
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
          "—"
        ),
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
          "—"
        ),
    },
    {
      accessorKey: "assignmentType",
      meta: { title: "Loại" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loại" />
      ),
      cell: ({ row }) => row.original.assignmentType || "—",
    },
    {
      id: "actions",
      header: () => <span className="flex justify-center">Hành động</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onCancel(row.original.id);
            }}
          >
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  return cols;
}