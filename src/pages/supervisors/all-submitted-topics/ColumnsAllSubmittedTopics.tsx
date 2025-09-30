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
import { Checkbox } from "@/components/globals/atoms/checkbox";
import type { TopicListItem } from "@/services/topicService";
import DataTableCellAbbreviation from "@/components/globals/molecules/data-table-abbreviation-cell";

export type ColumnActionsHandlers = {
  onViewDetail: (id: number) => void;
};

const OneLine = ({
  children,
  width = "max-w-[220px]",
}: {
  children: React.ReactNode;
  width?: string;
}) => (
  <div className={`min-w-0 ${width} overflow-hidden`}>
    <div className="truncate whitespace-nowrap">{children}</div>
  </div>
);

const TwoLines = ({
  children,
  width = "max-w-[360px]",
}: {
  children: React.ReactNode;
  width?: string;
}) => (
  <div className={`min-w-0 ${width} overflow-hidden`}>
    <div className="line-clamp-2 break-words whitespace-normal">{children}</div>
  </div>
);

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
    size: 40,
    maxSize: 40,
  },
  {
    accessorKey: "id",
    meta: { title: "Mã đề tài" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đề tài" />
    ),
    cell: ({ row }) => (
      <OneLine width="max-w-[90px]">{row.original.id}</OneLine>
    ),
    size: 100,
    maxSize: 120,
  },
  {
    accessorKey: "eN_Title",
    meta: { title: "Tên tiếng anh" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên tiếng anh" />
    ),
    cell: ({ row }) =>
      row.original.eN_Title ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.eN_Title} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 380,
    maxSize: 420,
  },
  {
    accessorKey: "vN_title",
    meta: { title: "Tên tiếng việt" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên tiếng việt" />
    ),
    cell: ({ row }) =>
      row.original.vN_title ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.vN_title} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 380,
    maxSize: 420,
  },
  {
    accessorKey: "abbreviation",
    meta: { title: "Viết tắt" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Viết tắt" />
    ),
    cell: ({ row }) =>
      row.original.abbreviation ? (
        <OneLine width="max-w-[140px]">
          <DataTableCellAbbreviation abbreviation={row.original.abbreviation} />
        </OneLine>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 160,
    maxSize: 180,
  },
  {
    accessorKey: "categoryName",
    meta: { title: "Danh mục" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => (
      <OneLine width="max-w-[180px]">
        {row.original.categoryName ?? "-"}
      </OneLine>
    ),
    size: 200,
    maxSize: 220,
  },
  {
    accessorKey: "semesterName",
    meta: { title: "Học kỳ" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Học kỳ" />
    ),
    cell: ({ row }) => (
      <OneLine width="max-w-[160px]">
        {row.original.semesterName ?? "-"}
      </OneLine>
    ),
    size: 180,
    maxSize: 200,
  },
  {
    accessorKey: "description",
    meta: { title: "Mô tả" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) =>
      row.original.description ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.description} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 380,
    maxSize: 420,
  },
  {
    accessorKey: "problem",
    meta: { title: "Vấn đề" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vấn đề" />
    ),
    cell: ({ row }) =>
      row.original.problem ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.problem} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 380,
    maxSize: 420,
  },
  {
    accessorKey: "context",
    meta: { title: "Bối cảnh" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bối cảnh" />
    ),
    cell: ({ row }) =>
      row.original.context ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.context} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 380,
    maxSize: 420,
  },
  {
    accessorKey: "content",
    meta: { title: "Nội dung" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nội dung" />
    ),
    cell: ({ row }) =>
      row.original.content ? (
        <TwoLines width="max-w-[360px]">
          <DataTableCellDescription description={row.original.content} />
        </TwoLines>
      ) : (
        <span className="text-neutral-400">--</span>
      ),
    size: 380,
    maxSize: 420,
  },
  {
    accessorKey: "maxStudents",
    meta: { title: "SV tối đa" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SV tối đa" />
    ),
    cell: ({ row }) => (
      <OneLine width="max-w-[90px]">{row.original.maxStudents}</OneLine>
    ),
    size: 110,
    maxSize: 130,
  },
  {
    accessorKey: "hasSubmitted",
    meta: { title: "Trạng thái nộp" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái nộp" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <Badge className="whitespace-nowrap">
          {row.original.hasSubmitted ? "Đã nộp" : "Chưa nộp"}
        </Badge>
      </div>
    ),
    size: 160,
    maxSize: 180,
  },
  {
    accessorKey: "latestSubmissionStatus",
    meta: { title: "Trạng thái " },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái " center />
    ),
    cell: ({ row }) => {
      const s = (row.original.latestSubmissionStatus ?? "").toString();
      const sv = s.toLowerCase();
      const color =
        sv === "approved"
          ? "green"
          : sv.includes("reject")
            ? "red"
            : sv === "underreview" || sv === "under_review" || sv === "review"
              ? "dodgerblue"
              : sv === "submitted"
                ? "slategray"
                : "orange";
      return (
        <div className="flex justify-center pr-4">
          <Badge
            className="whitespace-nowrap text-white"
            style={{ backgroundColor: color }}
          >
            {s || "--"}
          </Badge>
        </div>
      );
    },
    size: 150,
    maxSize: 170,
  },
  {
    accessorKey: "currentVersionNumber",
    meta: { title: "Version" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Version" center />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center pr-4">
        <OneLine width="max-w-[80px]">
          {row.original.currentVersionNumber ?? "-"}
        </OneLine>
      </div>
    ),
    size: 120,
    maxSize: 140,
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
          className="whitespace-nowrap text-white"
          style={{ backgroundColor: row.original.isLegacy ? "green" : "red" }}
        >
          {row.original.isLegacy ? "Có" : "Không"}
        </Badge>
      </div>
    ),
    size: 120,
    maxSize: 140,
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
          className="whitespace-nowrap text-white"
          style={{
            backgroundColor: row.original.isApproved ? "green" : "orange",
          }}
        >
          {row.original.isApproved ? "Đã duyệt" : "Chưa duyệt"}
        </Badge>
      </div>
    ),
    size: 130,
    maxSize: 150,
  },
  {
    accessorKey: "createdAt",
    meta: { title: "Ngày tạo" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => (
      <OneLine width="max-w-[140px]">
        <DataTableDate date={row.original.createdAt} />
      </OneLine>
    ),
    size: 160,
    maxSize: 180,
  },
  {
    accessorKey: "latestSubmittedAt",
    meta: { title: "Ngày nộp" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày nộp" />
    ),
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
    size: 140,
    maxSize: 160,
  },
];
