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

type StatusKey =
  | "Pending"
  | "UnderReview"
  | "Duplicate"
  | "Completed"
  | "RevisionRequired"
  | "EscalatedToModerator"
  | "Approved"
  | "Rejected";

const STATUS_BY_NUM: Record<number, StatusKey> = {
  1: "Pending",
  2: "UnderReview",
  3: "Duplicate",
  4: "Completed",
  5: "RevisionRequired",
  6: "EscalatedToModerator",
  7: "Approved",
  8: "Rejected",
};

const STATUS_META: Record<StatusKey, { vi: string; color: string }> = {
  Pending: { vi: "Chờ xử lý", color: "orange" },
  UnderReview: { vi: "Đang xét duyệt", color: "dodgerblue" },
  Duplicate: { vi: "Trùng lặp", color: "orchid" },
  Completed: { vi: "Hoàn tất", color: "teal" },
  RevisionRequired: { vi: "Yêu cầu chỉnh sửa", color: "goldenrod" },
  EscalatedToModerator: { vi: "Chuyển điều phối", color: "mediumpurple" },
  Approved: { vi: "Đã phê duyệt", color: "green" },
  Rejected: { vi: "Từ chối", color: "red" },
};

function normalizeLatestStatus(v: unknown): StatusKey | null {
  if (typeof v === "number" && STATUS_BY_NUM[v]) return STATUS_BY_NUM[v];
  if (typeof v === "string") {
    const s = v
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
    if (s === "pending") return "Pending";
    if (s === "underreview" || s === "review") return "UnderReview";
    if (s === "duplicate") return "Duplicate";
    if (s === "completed" || s === "done" || s === "finished")
      return "Completed";
    if (s === "revisionrequired" || s === "requirerevision")
      return "RevisionRequired";
    if (s === "escalatedtomoderator" || s === "escalated")
      return "EscalatedToModerator";
    if (s === "approved") return "Approved";
    if (s.includes("reject")) return "Rejected";
  }
  return null;
}

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
    accessorKey: "currentVersionNumber",
    meta: { title: "Phiên bản" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phiên bản" center />
    ),
    cell: ({ row }) => {
      const num = row.original.currentVersionNumber;
      return (
        <div className="flex justify-center pr-4">
          {num == null ? (
            <Badge className="bg-slate-500 whitespace-nowrap text-white">
              Bản gốc
            </Badge>
          ) : (
            <Badge className="bg-indigo-600 whitespace-nowrap text-white">
              {num} Phiên bản
            </Badge>
          )}
        </div>
      );
    },
    size: 140,
    maxSize: 160,
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
    meta: { title: "Trạng thái" },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" center />
    ),
    cell: ({ row }) => {
      const key = normalizeLatestStatus(row.original.latestSubmissionStatus);
      const label = key ? STATUS_META[key].vi : "Chưa nộp";
      const color = key ? STATUS_META[key].color : "slategray";
      return (
        <div className="flex justify-center pr-4">
          <Badge
            className="whitespace-nowrap text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </Badge>
        </div>
      );
    },
    size: 150,
    maxSize: 170,
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
