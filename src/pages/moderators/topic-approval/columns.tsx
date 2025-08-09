import { ColumnDef } from "@tanstack/react-table";
import { TopicType } from "@/schemas/topicSchema";
import { Copy, Eye, List, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/globals/atoms/dropdown-menu";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import DataTableCellDescription from "@/components/globals/molecules/data-table-description-cell";
import DataTableCellTopic from "@/components/globals/molecules/data-table-topic-cell";
import { Badge } from "@/components/globals/atoms/badge";

export type ColumnActionsHandlers = {
  onViewDetail: (id: string) => void;
  onAssignReviewer: (id: string) => void;
};

export const createColumns = (
  handlers: ColumnActionsHandlers
): ColumnDef<TopicType>[] => [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
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
    accessorKey: "description",
    header: "Ghi chú",
    cell: ({ row }) =>
      row.original.description ? (
        <DataTableCellDescription description={row.original.description} />
      ) : (
        "--"
      ),
  },
  {
    accessorKey: "currentVersion.methodology",
    meta: { title: "Kỹ năng" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kỹ năng" />
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
        {row.original.isApproved ? (
          <Badge className="text-white" style={{ backgroundColor: "green" }}>
            Đã duyệt
          </Badge>
        ) : (
          <Badge className="text-white" style={{ backgroundColor: "orange" }}>
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
    cell: ({ row }) => <DataTableDate date={row.original.createdAt} />,
  },
  {
    id: "actions",
    header: () => <span className="flex items-center justify-center">Thao tác</span>,
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
                onClick={() => navigator.clipboard.writeText(topic.id)}
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(topic.id)}
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onAssignReviewer(topic.id)}
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
