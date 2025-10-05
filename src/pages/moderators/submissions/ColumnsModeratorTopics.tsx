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
import DataTableCellDescription from "@/components/globals/molecules/data-table-description-cell";
import DataTableCellAbbreviation from "@/components/globals/molecules/data-table-abbreviation-cell";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import type { TopicListItem } from "@/services/topicService";

export type ModeratorColumnActions = {
  onViewSubmission: (topicId: number, preferredSubmissionId?: number) => void;
  onOpenAssignments: (topicId: number) => void;
  onOpenFinalDecision: (topicId: number) => void;
};

const OneLine = ({ children, width = "max-w-[220px]" }: { children: React.ReactNode; width?: string }) => (
  <div className={`min-w-0 ${width} overflow-hidden`}>
    <div className="truncate whitespace-nowrap">{children}</div>
  </div>
);

const TwoLines = ({ children, width = "max-w-[360px]" }: { children: React.ReactNode; width?: string }) => (
  <div className={`min-w-0 ${width} overflow-hidden`}>
    <div className="line-clamp-2 break-words whitespace-normal">{children}</div>
  </div>
);

const statusColor = (s?: unknown) => {
  const raw = typeof s === "string" ? s : "";
  const v = raw.toLowerCase();
  if (v.includes("approve") || v.includes("approved")) return "green";
  if (v.includes("reject") || v.includes("rejected")) return "red";
  if (v.includes("escalat")) return "mediumpurple";
  if (v.includes("revision")) return "goldenrod";
  if (v.includes("duplicate")) return "orchid";
  if (v.includes("under") || v.includes("pending")) return "orange";
  return "slategray";
};

export const createModeratorTopicColumns = (handlers: ModeratorColumnActions): ColumnDef<TopicListItem, unknown>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
    size: 40,
    maxSize: 40,
  },
  {
    accessorKey: "id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mã" />,
    cell: ({ row }) => <OneLine width="max-w-[90px]">#{row.original.id}</OneLine>,
    size: 80,
    maxSize: 100,
  },
  {
    accessorKey: "eN_Title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề (EN)" />,
    cell: ({ row }) =>
      row.original.eN_Title ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.eN_Title} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 360,
    maxSize: 420,
  },
  {
    accessorKey: "abbreviation",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Mã đề tài" />,
    cell: ({ row }) =>
      row.original.abbreviation ? (
        <OneLine width="max-w-[120px]">
          <DataTableCellAbbreviation abbreviation={row.original.abbreviation} />
        </OneLine>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 120,
    maxSize: 140,
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Danh mục" />,
    cell: ({ row }) => <OneLine width="max-w-[160px]">{row.original.categoryName ?? "-"}</OneLine>,
    size: 160,
    maxSize: 180,
  },
  {
    accessorKey: "semesterName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Học kỳ" />,
    cell: ({ row }) => <OneLine width="max-w-[120px]">{row.original.semesterName ?? "-"}</OneLine>,
    size: 140,
    maxSize: 160,
  },
  {
    accessorKey: "latestSubmissionStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" center />,
    cell: ({ row }) => {
      const s = row.original.latestSubmissionStatus ?? "--";
      return (
        <div className="flex justify-center">
          <Badge style={{ backgroundColor: statusColor(s), color: "white" }} className="whitespace-nowrap">
            {String(s)}
          </Badge>
        </div>
      );
    },
    size: 160,
    maxSize: 180,
  },
  {
    accessorKey: "latestSubmittedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nộp lúc" />,
    cell: ({ row }) =>
      row.original.latestSubmittedAt ? (
        <OneLine width="max-w-[140px]">
          <DataTableDate date={row.original.latestSubmittedAt} />
        </OneLine>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 160,
    maxSize: 180,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
    cell: ({ row }) => (
      <OneLine width="max-w-[140px]">
        <DataTableDate date={row.original.createdAt} />
      </OneLine>
    ),
    size: 160,
    maxSize: 180,
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

              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(topic.id))}>
                <Copy className="h-4 w-4" />
                Sao chép mã
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handlers.onViewSubmission(topic.id)}>
                <Eye className="h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 140,
    maxSize: 160,
  },
];

export default createModeratorTopicColumns;
