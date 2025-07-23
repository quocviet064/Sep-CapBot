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
import { TopicType } from "@/schemas/topicSchema";

import { ColumnDef } from "@tanstack/react-table";

import { Copy, Eye, MoreHorizontal } from "lucide-react";

export type ColumnActionsHandlers = {
  onViewDetail: (id: string) => void;
};

export const createColumns = (
  handlers: ColumnActionsHandlers,
): ColumnDef<TopicType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="mb-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
    accessorKey: "supervisorId",
    meta: { title: "Mã giảng viên" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã giảng viên" />
    ),
  },
  {
    accessorKey: "categoryId",
    meta: { title: "Mã danh mục" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã danh mục" />
    ),
  },
  {
    accessorKey: "semesterId",
    meta: { title: "Mã kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã kỳ" />
    ),
  },
  {
    accessorKey: "title",
    meta: { title: "Đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đề tài" />
    ),
    cell: ({ row }) => {
      const titleTopic = row.original.title;
      const supervisorTopic = row.original.supervisor;
      return (
        <DataTableCellTopic title={titleTopic} supervisor={supervisorTopic} />
      );
    },
  },
  {
    accessorKey: "supervisor",
    meta: { title: "Giảng viên" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giảng viên" />
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
    accessorKey: "objectives",
    meta: { title: "Mục tiêu" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mục tiêu" />
    ),
  },
  {
    accessorKey: "maxStudents",
    meta: { title: "Sinh viên" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sinh viên" />
    ),
  },

  {
    accessorKey: "isLegacy",
    meta: { title: "Reviewer" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reviewer" center />
    ),
    cell: ({ row }) => {
      const isLegacy = row.original.isLegacy;

      return (
        <div className="flex justify-center pr-4">
          <Badge
            className="text-white"
            style={{ backgroundColor: isLegacy ? "green" : "red" }}
          >
            {isLegacy ? "Đã gán" : "Chưa gán"}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "isApproved",
    meta: { title: "Trạng thái" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" center />
    ),
    cell: ({ row }) => {
      const isApproved = row.original.isApproved;

      return (
        <div className="flex justify-center pr-4">
          {isApproved ? "Đã duyệt" : "Chưa duyệt"}
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
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return <DataTableDate date={createdAt} />;
    },
  },

  {
    accessorKey: "updatedAt",
    meta: { title: "Ngày cập nhật" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày cập nhật" />
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;
      return <DataTableDate date={updatedAt} />;
    },
  },

  {
    id: "actions",
    header: () => (
      <span className="flex items-center justify-center">Thao tác</span>
    ),
    cell: ({ row }) => {
      const topicData = row.original;

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
                onClick={() => navigator.clipboard.writeText(topicData.id)}
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(topicData.id)}
              >
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
