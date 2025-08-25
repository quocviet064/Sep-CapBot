import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/globals/atoms/button";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/globals/atoms/dropdown-menu";
import { Copy, Eye, MoreHorizontal } from "lucide-react";
import DataTableCellDescription from "@/components/globals/molecules/data-table-description-cell";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { CategoryType } from "@/schemas/categorySchema";
import { toast } from "sonner";

export type ColumnActionsHandlers = {
  onViewDetail: (id: string) => void;
};

export const createColumns = (
  handlers: ColumnActionsHandlers,
): ColumnDef<CategoryType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label="Select all"
        className="mb-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="mb-2"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    meta: { title: "Mã danh mục" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã danh mục" />
    ),
    cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
  },
  {
    accessorKey: "name",
    meta: { title: "Tên danh mục" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên danh mục" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[380px] truncate font-medium text-neutral-900">
        {row.original.name || "--"}
      </div>
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
    accessorKey: "topicsCount",
    meta: { title: "Số lượng đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng đề tài" />
    ),
    cell: ({ row }) => <span>{row.original.topicsCount ?? 0}</span>,
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
                  toast.success("Đã sao chép mã danh mục");
                }}
                className="cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(String(item.id))}
                className="cursor-pointer"
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
