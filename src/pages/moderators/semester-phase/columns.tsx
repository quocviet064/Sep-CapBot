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
import { Checkbox } from "@/components/globals/atoms/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getSemesterDetail, SemesterDTO } from "@/services/semesterService";
import { formatDate } from "@/utils/formatter";

export type ColumnActionsHandlers = {
  onViewDetail: (id: string) => void;
};

function DateCell({ id, type }: { id: number; type: "start" | "end" }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["semesterDetail", id],
    queryFn: async () => {
      const res = await getSemesterDetail(id);
      if (!res.data.success) throw new Error(res.data.message || "Error");
      return res.data.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) return <span className="text-muted-foreground">…</span>;
  if (isError || !data) return <span>—</span>;

  const val = type === "start" ? data.startDate : data.endDate;
  return <span>{formatDate(val) || "—"}</span>;
}

export const createColumns = (
  handlers: ColumnActionsHandlers
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
  },
  {
    accessorKey: "name",
    meta: { title: "Tên học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên học kỳ" />
    ),
  },
  {
    id: "startDate",
    meta: { title: "Ngày bắt đầu" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày bắt đầu" />
    ),
    cell: ({ row }) => <DateCell id={row.original.id} type="start" />,
  },
  {
    id: "endDate",
    meta: { title: "Ngày kết thúc" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày kết thúc" />
    ),
    cell: ({ row }) => <DateCell id={row.original.id} type="end" />,
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => <span className="flex justify-center">Thao tác</span>,
    cell: ({ row }) => {
      const sem = row.original;
      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Mở menu">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(sem.id))}
              >
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers.onViewDetail(String(sem.id))}
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
