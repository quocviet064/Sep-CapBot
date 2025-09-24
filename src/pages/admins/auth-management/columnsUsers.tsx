import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import { Button } from "@/components/globals/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/globals/atoms/dropdown-menu";
import { Copy, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import type { UserDTO } from "@/services/authService";

export type UserColumnHandlers = {
  onViewDetail?: (id: string | number) => void;
  onCopyId?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export const createUserColumns = (
  handlers: UserColumnHandlers = {},
): ColumnDef<UserDTO>[] => [
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
    meta: { title: "Mã" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã" />
    ),
    cell: ({ row }) => <span>#{row.original.id}</span>,
  },
  {
    accessorKey: "userName",
    meta: { title: "Tên đăng nhập" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên đăng nhập" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.userName || "--"}</span>
    ),
  },
  {
    accessorKey: "email",
    meta: { title: "Email" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="truncate">{row.original.email || "--"}</span>
    ),
  },
  {
    accessorKey: "phoneNumber",
    meta: { title: "SĐT" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SĐT" />
    ),
    cell: ({ row }) => (
      <span className="truncate">{row.original.phoneNumber || "--"}</span>
    ),
  },
  {
    accessorKey: "roleInUserOverviewDTOs",
    meta: { title: "Vai trò" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => {
      const roles = row.original.roleInUserOverviewDTOs ?? [];
      const text = roles.map((r) => r.name).join(", ");
      return <span className="truncate">{text || "--"}</span>;
    },
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
        <span>--</span>
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
                onClick={() => handlers.onViewDetail?.(item.id)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handlers.onDelete?.(item.id)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Xoá
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
