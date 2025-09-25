import type { ColumnDef } from "@tanstack/react-table";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { Button } from "@/components/globals/atoms/button";
import type { SubmissionListItem } from "@/services/submissionService";

export type SubmissionMode = "assign" | "approve";

export type SubmissionColumnHandlers = {
  onViewDetail: (row: SubmissionListItem) => void;
  onAssignReviewer?: (row: SubmissionListItem) => void;
};

export function createSubmissionColumns(
  mode: SubmissionMode,
  handlers: SubmissionColumnHandlers
): ColumnDef<SubmissionListItem>[] {
  const cols: ColumnDef<SubmissionListItem>[] = [
    {
      accessorKey: "id",
      meta: { title: "Submission ID" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submission ID" />
      ),
      cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
    },
    {
      accessorKey: "topicTitle",
      meta: { title: "Đề tài" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đề tài" />
      ),
      cell: ({ row }) => row.original.topicTitle || "—",
    },
    {
      accessorKey: "submittedByName",
      meta: { title: "Người nộp" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Người nộp" />
      ),
      cell: ({ row }) => row.original.submittedByName || "—",
    },
    {
      accessorKey: "submissionRound",
      meta: { title: "Vòng nộp" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vòng nộp" />
      ),
      cell: ({ row }) => row.original.submissionRound ?? "—",
    },
    {
      accessorKey: "submittedAt",
      meta: { title: "Ngày nộp" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày nộp" />
      ),
      cell: ({ row }) =>
        row.original.submittedAt ? (
          <DataTableDate date={row.original.submittedAt} />
        ) : (
          "—"
        ),
    },
    {
      id: "actions",
      header: () => <span className="flex justify-center">Hành động</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlers.onViewDetail(r);
              }}
            >
              Xem
            </Button>

            {mode === "assign" && handlers.onAssignReviewer && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onAssignReviewer!(r);
                }}
              >
                Assign
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return cols;
}