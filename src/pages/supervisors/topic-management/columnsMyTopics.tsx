import { ColumnDef } from "@tanstack/react-table";
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
import { TopicType } from "@/schemas/topicSchema";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import DataTableCellTopic from "@/components/globals/molecules/data-table-topic-cell";
import { Checkbox } from "@/components/globals/atoms/checkbox";

export type ColumnActionsHandlers = {
  onViewDetail: (id: string) => void;
};

export const createMyTopicColumns = (
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
    accessorKey: "title",
    meta: { title: "Đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đề tài" />
    ),
    cell: ({ row }) => (
      <DataTableCellTopic
        title={row.original.title}
        supervisor={row.original.supervisorName}
      />
    ),
  },
  {
    accessorKey: "supervisorName",
    meta: { title: "Giảng viên" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giảng viên" />
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
    meta: { title: "Học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Học kỳ" />
    ),
  },
  {
    accessorKey: "maxStudents",
    meta: { title: "Số SV tối đa" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số SV tối đa" />
    ),
  },
  {
    accessorKey: "isLegacy",
    meta: { title: "Reviewer" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reviewer" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <Badge
          className="text-white"
          style={{ backgroundColor: row.original.isLegacy ? "green" : "red" }}
        >
          {row.original.isLegacy ? "Đã gán" : "Chưa gán"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "isApproved",
    meta: { title: "Trạng thái" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        {row.original.isApproved ? "Đã duyệt" : "Chưa duyệt"}
      </div>
    ),
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
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="flex justify-center">Thao tác</span>,
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
                onClick={() =>
                  navigator.clipboard.writeText(topic.id.toString())
                }
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(topic.id.toString())}
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
