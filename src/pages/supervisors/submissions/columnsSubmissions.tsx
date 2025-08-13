import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import { Copy, Eye, MoreHorizontal } from "lucide-react";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { SubmissionType } from "@/services/submissionService";

export type SubmissionColumnHandlers = {
  onViewDetail: (submissionId: string) => void;
};

const StatusPill = ({ value }: { value?: string }) => {
  const v = value || "--";
  const palette =
    v === "Approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v === "Rejected"
        ? "bg-red-50 text-red-700 border-red-200"
        : v === "Submitted"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-gray-50 text-gray-700 border-gray-200";
  return <Badge className={`border ${palette}`}>{v}</Badge>;
};

export const createSubmissionColumns = (
  handlers: SubmissionColumnHandlers,
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
    meta: { title: "Mã submission" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã submission" />
    ),
  },
  {
    accessorKey: "topicVersionId",
    meta: { title: "Version" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" />
    ),
    cell: ({ row }) => <span>v{row.original.topicVersionId}</span>,
  },
  {
    accessorKey: "topicTitle",
    meta: { title: "Đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đề tài" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[380px] truncate">
        {row.original.topicTitle || "--"}
      </div>
    ),
  },
  {
    accessorKey: "phaseName",
    meta: { title: "Giai đoạn" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giai đoạn" />
    ),
    cell: ({ row }) =>
      row.original.phaseName || `#${row.original.phaseId ?? "--"}`,
  },
  {
    accessorKey: "semesterName",
    meta: { title: "Học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Học kỳ" />
    ),
    cell: ({ row }) =>
      row.original.semesterName || `#${row.original.semesterId ?? "--"}`,
  },
  {
    accessorKey: "status",
    meta: { title: "Trạng thái" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <StatusPill value={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Ngày tạo" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) =>
      row.original.createdAt ? (
        <DataTableDate date={row.original.createdAt} />
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
                onClick={() => navigator.clipboard.writeText(String(item.id))}
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(String(item.id))}
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
