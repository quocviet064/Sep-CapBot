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
import { Copy, Eye, MoreHorizontal } from "lucide-react";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import type { SemesterDTO } from "@/services/semesterService";

export type SemesterColumnHandlers = {
  onViewDetail: (semesterId: string) => void;
  onCopyId?: (id: number) => void;
};

export const createSemesterColumns = (
  handlers: SemesterColumnHandlers,
): ColumnDef<SemesterDTO>[] => [
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
    meta: { title: "Mã học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã học kỳ" />
    ),
    cell: ({ row }) => <span>#{row.original.id}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "name",
    meta: { title: "Tên học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên học kỳ" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[380px] truncate font-medium text-neutral-900">
        {row.original.name || "--"}
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    meta: { title: "Bắt đầu" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bắt đầu" />
    ),
    cell: ({ row }) => <DataTableDate date={row.original.startDate} />,
  },
  {
    accessorKey: "endDate",
    meta: { title: "Kết thúc" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kết thúc" />
    ),
    cell: ({ row }) => <DataTableDate date={row.original.endDate} />,
  },
  {
    accessorKey: "description",
    meta: { title: "Mô tả" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[420px] truncate text-neutral-700">
        {row.original.description || "--"}
      </div>
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
