import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/globals/atoms/button";
import { Input } from "@/components/globals/atoms/input";
import { DataTable } from "@/components/globals/atoms/data-table";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import LoadingPage from "@/pages/loading-page";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { useSubmissions } from "@/hooks/useSubmission";
import { type SubmissionType } from "@/services/submissionService";
import SubmissionAssignmentsDialog from "../submissions/SubmissionAssignmentsDialog";

/** Visibility cho bảng submissions */
const SUBMISSION_VISIBILITY = {
  submittedByName: true,
  submissionRound: true,
  submittedAt: true,
};

export default function ReviewerAssignmentsPage() {
  // ---- SUBMISSION LIST (server paging + search)
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");

  const { data: subRes, isLoading: subsLoading, error: subsErr } = useSubmissions({
    PageNumber: pageNumber,
    PageSize: pageSize,
    Keyword: keyword || undefined,
  });
  const submissions: SubmissionType[] = subRes?.listObjects ?? [];

  // ---- DIALOG xem reviewers theo submission
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogSubmissionId, setDialogSubmissionId] = useState<string | number | undefined>(undefined);

  // ---- COLUMNS: SUBMISSIONS
  const submissionColumns = useMemo<ColumnDef<SubmissionType>[]>(() => [
    {
      accessorKey: "id",
      meta: { title: "Submission" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submission" />,
    },
    {
      id: "submittedByName",
      meta: { title: "Supervisor" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Supervisor" />,
      cell: ({ row }) => {
        const r = row.original as SubmissionType;
        const name = r.submittedByName as string | undefined;
        const uid = r.submittedBy as string | number | undefined;
        return name ? `${name}${uid ? ` (#${uid})` : ""}` : uid ? `#${uid}` : "--";
      },
    },
    {
      id: "submissionRound",
      meta: { title: "Round" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Round" />,
      cell: ({ row }) => (row.original as SubmissionType).submissionRound ?? 1,
    },
    {
      id: "submittedAt",
      meta: { title: "Submitted at" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted at" />,
      cell: ({ row }) => <DataTableDate date={(row.original as SubmissionType).submittedAt} />,
    },
    {
      id: "actions",
      header: () => <span className="flex items-center justify-center">Thao tác</span>,
      cell: ({ row }) => {
        const s = row.original as SubmissionType;
        return (
          <div className="flex items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              title="Xem reviewers đã phân công"
              aria-label="Xem reviewers đã phân công"
              onClick={() => {
                if (!s.id) return toast.info("Submission không hợp lệ");
                setDialogSubmissionId(s.id as number | string);
                setIsDialogOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  // ---- RENDER
  if (subsLoading) return <LoadingPage />;
  if (subsErr) return <div className="p-6 text-red-600">Lỗi tải submissions</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <label htmlFor="submissionKeyword" className="block text-sm mb-1">
            Tìm kiếm submission
          </label>
          <Input
            id="submissionKeyword"
            placeholder="Nhập từ khoá..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* BẢNG SUBMISSIONS */}
      <DataTable<SubmissionType, unknown>
        data={submissions}
        columns={submissionColumns}
        visibility={SUBMISSION_VISIBILITY as any}
        search={keyword}
        setSearch={setKeyword}
        placeholder="Tìm kiếm submission..."
        page={pageNumber}
        setPage={setPageNumber}
        totalPages={subRes?.totalPages || 1}
        limit={pageSize}
        setLimit={setPageSize}
      />

      {/* POPUP: reviewers đã phân công cho submission */}
      <SubmissionAssignmentsDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setDialogSubmissionId(undefined);
        }}
        submissionId={dialogSubmissionId}
      />
    </div>
  );
}
