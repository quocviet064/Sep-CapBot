import { ColumnDef } from "@tanstack/react-table";
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
import type { PhaseType } from "@/schemas/phaseTypeSchema";

export type ColumnActionsHandlers = {
  onCopyId?: (id: number) => void;
  onViewDetail: (id: string) => void;
};

export const createPhaseTypeColumns = (
  handlers: ColumnActionsHandlers,
): ColumnDef<PhaseType>[] => [
  {
    accessorKey: "id",
    meta: { title: "Mã loại" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã loại" />
    ),
    cell: ({ row }) => <span>#{row.original.id}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "name",
    meta: { title: "Tên giai đoạn" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên giai đoạn" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-neutral-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "description",
    meta: { title: "Mô tả" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => (
      <div className="line-clamp-2 max-w-[520px] text-sm text-neutral-700">
        {row.original.description || "—"}
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
                <Copy className="mr-2 h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(String(item.id))}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
