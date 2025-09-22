// columnsMyTopics.tsx
import type { ColumnDef } from "@tanstack/react-table";
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
import DataTableCellTopic from "@/components/globals/molecules/data-table-topic-cell";
import DataTableCellDescription from "@/components/globals/molecules/data-table-description-cell";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import type { TopicListItem } from "@/services/topicService";

export type ColumnActionsHandlers = {
  onViewDetail: (id: number) => void;
};

export const createMyTopicColumns = (
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
    accessorKey: "eN_Title",
    meta: { title: "Title (EN)" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title (EN)" />
    ),
    cell: ({ row }) => (
      <DataTableCellTopic
        title={row.original.eN_Title || "-"}
        supervisor={row.original.supervisorName}
      />
    ),
  },
  {
    accessorKey: "vN_title",
    meta: { title: "Tiêu đề (VN)" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề (VN)" />
    ),
    cell: ({ row }) => (
      <span className="line-clamp-2">{row.original.vN_title || "-"}</span>
    ),
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
    meta: { title: "Học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Học kỳ" />
    ),
  },
  {
    accessorKey: "description",
    meta: { title: "Mô tả" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) =>
      row.original.description ? (
        <DataTableCellDescription description={row.original.description} />
      ) : (
        <span>--</span>
      ),
  },
  {
    accessorKey: "problem",
    meta: { title: "Vấn đề" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vấn đề" />
    ),
    cell: ({ row }) =>
      row.original.problem ? (
        <DataTableCellDescription description={row.original.problem} />
      ) : (
        <span>--</span>
      ),
  },
  {
    accessorKey: "context",
    meta: { title: "Bối cảnh" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bối cảnh" />
    ),
    cell: ({ row }) =>
      row.original.context ? (
        <DataTableCellDescription description={row.original.context} />
      ) : (
        <span>--</span>
      ),
  },
  {
    accessorKey: "content",
    meta: { title: "Nội dung" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nội dung" />
    ),
    cell: ({ row }) =>
      row.original.content ? (
        <DataTableCellDescription description={row.original.content} />
      ) : (
        <span>--</span>
      ),
  },
  {
    accessorKey: "maxStudents",
    meta: { title: "SV tối đa" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SV tối đa" />
    ),
  },
  {
    accessorKey: "currentStatus",
    meta: { title: "Trạng thái" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <Badge>{row.original.currentStatus || "-"}</Badge>
      </div>
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
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <Badge
          className="text-white"
          style={{ backgroundColor: row.original.isLegacy ? "green" : "red" }}
        >
          {row.original.isLegacy ? "Có" : "Không"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "isApproved",
    meta: { title: "Duyệt" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duyệt" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <Badge
          className="text-white"
          style={{
            backgroundColor: row.original.isApproved ? "green" : "orange",
          }}
        >
          {row.original.isApproved ? "Đã duyệt" : "Chưa duyệt"}
        </Badge>
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
  },
];
