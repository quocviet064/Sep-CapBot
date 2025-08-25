import { ColumnDef } from "@tanstack/react-table";
import { Copy, Eye, List, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import DataTableCellDescription from "@/components/globals/molecules/data-table-description-cell";
import DataTableCellTopic from "@/components/globals/molecules/data-table-topic-cell";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Badge } from "@/components/globals/atoms/badge";
import { toast } from "sonner";
import type { TopicType } from "@/schemas/topicSchema";

export type ColumnActionsHandlers = {
  onViewDetail?: (id: string) => void;
  onAssignReviewer: (topic: TopicType) => void;
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
    meta: { title: "Mã đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đề tài" />
    ),
    cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
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
    accessorKey: "description",
    meta: { title: "Ghi chú" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ghi chú" />
    ),
    cell: ({ row }) =>
      row.original.description ? (
        <DataTableCellDescription description={row.original.description} />
      ) : (
        "--"
      ),
  },
  {
    accessorKey: "categoryName",
    meta: { title: "Danh mục" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => <span>{row.original.categoryName || "--"}</span>,
  },
  {
    accessorKey: "isApproved",
    meta: { title: "Trạng thái" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        {row.original.isApproved ? (
          <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
            Đã duyệt
          </Badge>
        ) : (
          <Badge className="rounded-full border-amber-200 bg-amber-50 text-amber-700">
            Chưa duyệt
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Ngày tạo" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => <DataTableDate date={row.original.createdAt ?? ""} />,
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => (
      <span className="flex items-center justify-center">Thao tác</span>
    ),
    cell: ({ row }) => {
      const topic = row.original;
      const idStr = String(topic.id);
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
                  navigator.clipboard.writeText(idStr);
                  toast.success("Đã sao chép mã đề tài");
                }}
                className="cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to={`/moderators/topic-approval/${idStr}`}
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => handlers.onViewDetail?.(idStr)}
                >
                  <Eye className="h-4 w-4" />
                  Xem chi tiết
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handlers.onAssignReviewer(topic)}
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
  },
];
