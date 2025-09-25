import { Badge } from "@/components/globals/atoms/badge";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import DataTableCellDescription from "@/components/globals/molecules/data-table-description-cell";
import DataTableCellTopic from "@/components/globals/molecules/data-table-topic-cell";
import type { ColumnDef } from "@tanstack/react-table";
import type { TopicListItem } from "@/services/topicService";
import { Copy, Eye, MoreHorizontal } from "lucide-react";

export type ColumnActionsHandlers = {
  onViewDetail: (id: number) => void;
};

export const createColumns = (
  handlers: ColumnActionsHandlers,
): ColumnDef<TopicListItem, unknown>[] => [
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
    meta: { title: "Mã đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đề tài" />
    ),
  },
  {
    id: "title",
    meta: { title: "Tên đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên đề tài" />
    ),
    cell: ({ row }) => {
      const title =
        row.original.eN_Title ||
        row.original.vN_title ||
        row.original.abbreviation ||
        "-";
      return (
        <DataTableCellTopic
          title={title}
          supervisor={row.original.supervisorName}
        />
      );
    },
  },
  {
    accessorKey: "abbreviation",
    meta: { title: "Viết tắt" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Viết tắt" />
    ),
  },
  {
    accessorKey: "categoryName",
    meta: { title: "Danh mục" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
  },
  {
    accessorKey: "semesterName",
    meta: { title: "Kỳ học" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kỳ học" />
    ),
  },
  {
    accessorKey: "description",
    header: "Ghi chú",
    cell: ({ row }) => {
      const notes = row.original.description;
      return notes ? <DataTableCellDescription description={notes} /> : "--";
    },
  },
  {
    accessorKey: "maxStudents",
    meta: { title: "SV tối đa" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SV tối đa" />
    ),
  },

  {
    accessorKey: "currentVersionNumber",
    meta: { title: "Version" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        {row.original.currentVersionNumber ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "isLegacy",
    meta: { title: "Legacy" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Legacy" center />
    ),
    cell: ({ row }) => {
      const v = row.original.isLegacy;
      return (
        <div className="flex justify-center pr-4">
          <Badge
            className="text-white"
            style={{ backgroundColor: v ? "green" : "red" }}
          >
            {v ? "Có" : "Không"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "isApproved",
    meta: { title: "Duyệt" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duyệt" center />
    ),
    cell: ({ row }) => {
      const v = row.original.isApproved;
      return (
        <div className="flex justify-center pr-4">
          <Badge
            className="text-white"
            style={{ backgroundColor: v ? "green" : "orange" }}
          >
            {v ? "Đã duyệt" : "Chưa duyệt"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Ngày tạo" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => <DataTableDate date={row.original.createdAt} />,
  },
  {
    id: "actions",
    header: () => (
      <span className="flex items-center justify-center">Thao tác</span>
    ),
    cell: ({ row }) => {
      const topic = row.original;
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
                onClick={() => navigator.clipboard.writeText(String(topic.id))}
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers.onViewDetail(topic.id)}>
                <Eye className="h-4 w-4" />
                Xem chi tiết
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
