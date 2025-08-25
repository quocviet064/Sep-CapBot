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
import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { toast } from "sonner";
import type {
  EvaluationCriteriaDTO,
  IdLike,
} from "@/services/evaluationCriteriaService";

export type EvaluationCriteriaColumnHandlers = {
  onViewDetail: (id: IdLike) => void;
  onEdit: (item: EvaluationCriteriaDTO) => void;
  onCopyId?: (id: IdLike) => void;
  onDelete?: (id: IdLike) => void;
};

export const createEvaluationCriteriaColumns = (
  handlers: EvaluationCriteriaColumnHandlers,
): ColumnDef<EvaluationCriteriaDTO>[] => [
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
    meta: { title: "Mã tiêu chí" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã tiêu chí" />
    ),
    cell: ({ row }) => {
      const id = String(row.original.id);
      const short = id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-3)}` : id;
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">#{short}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(id);
              handlers.onCopyId?.(row.original.id);
              toast.success("Copied ID");
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "name",
    meta: { title: "Tên tiêu chí" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên tiêu chí" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[380px] truncate font-medium text-neutral-900">
        {row.original.name || "--"}
      </div>
    ),
  },
  {
    accessorKey: "maxScore",
    meta: { title: "Điểm tối đa" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Điểm tối đa" />
    ),
    cell: ({ row }) => <span>{row.original.maxScore}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "weight",
    meta: { title: "Trọng số" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trọng số" />
    ),
    cell: ({ row }) => <span>{row.original.weight}</span>,
    enableSorting: true,
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
    accessorKey: "createdAt",
    meta: { title: "Tạo lúc" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tạo lúc" />
    ),
    cell: ({ row }) => <DataTableDate date={row.original.createdAt ?? ""} />,
  },
  {
    accessorFn: (r) => r.lastModifiedAt as string | undefined,
    id: "updatedAt",
    meta: { title: "Cập nhật" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ getValue }) => {
      const v = getValue<string | undefined>();
      const empty = !v || v.startsWith("0001-01-01");
      return empty ? (
        <span className="text-xs text-neutral-500 italic">
          Chưa có cập nhật
        </span>
      ) : (
        <DataTableDate date={v} />
      );
    },
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
                  toast.success("Copied ID");
                }}
                className="cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(item.id)}
                className="cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onEdit(item)}
                className="cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {handlers.onDelete && (
                <DropdownMenuItem
                  onClick={() => handlers.onDelete?.(item.id)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
