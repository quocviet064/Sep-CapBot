// src/components/reviewer-assignment/columnsReviewerAssignments.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import { Button } from "@/components/globals/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import { Copy, Eye, MoreHorizontal, UserPlus } from "lucide-react";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import type { SubmissionType } from "@/services/submissionService";

export type ReviewerAssignmentHandlers = {
  onViewDetail: (id: string | number) => void;
  onAssign: (id: string | number) => void;
  onCopyId?: (id: string | number) => void;
};

export const createReviewerAssignmentColumns = (
  handlers: ReviewerAssignmentHandlers,
): ColumnDef<SubmissionType>[] => [
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
    meta: { title: "Submission" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission" />
    ),
    cell: ({ row }) => <span>#{row.original.id}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "submittedByName",
    meta: { title: "Supervisor" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supervisor" />
    ),
    cell: ({ row }) => {
      const name = row.original.submittedByName as string | undefined;
      const uid = row.original.submittedBy as string | number | undefined;
      return name
        ? `${name}${uid ? ` (#${uid})` : ""}`
        : uid
          ? `#${uid}`
          : "--";
    },
  },
  {
    accessorKey: "submissionRound",
    meta: { title: "Round" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Round" />
    ),
    cell: ({ row }) => row.original.submissionRound ?? 1,
  },
  {
    accessorKey: "submittedAt",
    meta: { title: "Submitted at" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submitted at" />
    ),
    cell: ({ row }) =>
      row.original.submittedAt ? (
        <DataTableDate date={row.original.submittedAt} />
      ) : (
        "--"
      ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="flex justify-center">Thao tác</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(String(item.id));
                  handlers.onCopyId?.(item.id);
                }}
                className="cursor-pointer"
              >
                <Copy className="mr-2 h-4 w-4" />
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onAssign(item.id)}
                className="cursor-pointer"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Phân công
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(item.id)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
