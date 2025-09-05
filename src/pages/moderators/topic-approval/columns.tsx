import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Copy, Eye, List, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import { toast } from "sonner";
import type { SubmissionListItem } from "@/services/submissionService";

export type ColumnHandlers = {
  onViewDetail: (submissionId: number | string) => void;
  onAssignReviewer: (submissionId: number | string) => void;
};

export const createColumns = (
  handlers: ColumnHandlers
): ColumnDef<SubmissionListItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
        aria-label="Select all"
        className="mb-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
        aria-label="Select row"
        className="mb-2"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    meta: { title: "Submission ID" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission ID" />
    ),
    cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
  },
  {
    accessorKey: "submittedByName",
    meta: { title: "Người nộp" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người nộp" />
    ),
    cell: ({ row }) => row.original.submittedByName || "—",
  },
  {
    accessorKey: "submissionRound",
    meta: { title: "Vòng nộp" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vòng nộp" />
    ),
    cell: ({ row }) => row.original.submissionRound ?? "—",
  },
  {
    accessorKey: "submittedAt",
    meta: { title: "Ngày nộp" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày nộp" />
    ),
    cell: ({ row }) =>
      row.original.submittedAt ? (
        <DataTableDate date={row.original.submittedAt} />
      ) : (
        "—"
      ),
  },
  {
    id: "actions",
    header: () => <span className="flex items-center justify-center">Thao tác</span>,
    cell: ({ row }) => {
      const sub = row.original;
      const idStr = String(sub.id);

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(idStr);
                  toast.success("Đã sao chép mã submission");
                }}
                className="cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(sub.id)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handlers.onAssignReviewer(sub.id)}
                className="cursor-pointer"
              >
                <List className="h-4 w-4" />
                Phân công reviewer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
