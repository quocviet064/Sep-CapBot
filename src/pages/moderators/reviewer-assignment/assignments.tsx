import { useEffect, useMemo, useState, KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import { Input } from "@/components/globals/atoms/input";
import { Checkbox } from "@/components/globals/atoms/checkbox";
import DataTableColumnHeader from "@/components/globals/molecules/data-table-column-header";
import DataTableDate from "@/components/globals/molecules/data-table-date";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import {
  useAssignmentsBySubmission,
  useCancelAssignment,
  useUpdateAssignmentStatus,
} from "@/hooks/useReviewerAssignment";
import { AssignmentStatus, ReviewerAssignmentResponseDTO } from "@/services/reviewerAssignmentService";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

const DEFAULT_VISIBILITY = {
  assignedBy: false,
  deadline: true,
  startedAt: false,
  completedAt: false,
  assignedAt: true,
};

const statusLabel = (s: AssignmentStatus | number | undefined) => {
  switch (s) {
    case AssignmentStatus.Assigned: return "Đã phân công";
    case AssignmentStatus.InProgress: return "Đang đánh giá";
    case AssignmentStatus.Completed: return "Hoàn thành";
    case AssignmentStatus.Overdue: return "Quá hạn";
    default: return "--";
  }
};

export default function ReviewerAssignmentsPage() {
  // Read & drive URL param (?submissionId=...)
  const [searchParams, setSearchParams] = useSearchParams();
  const paramId = searchParams.get("submissionId") ?? "";

  // Controlled input bound to URL
  const [submissionInput, setSubmissionInput] = useState(paramId);
  useEffect(() => setSubmissionInput(paramId), [paramId]);

  const doSearch = () => {
    const v = submissionInput.trim();
    if (v) setSearchParams({ submissionId: v });
    else setSearchParams({});
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") doSearch();
  };

  // Fetch assignments (by submission)
  const { data, isLoading, error } = useAssignmentsBySubmission(
    paramId || undefined
  );

  const updMut = useUpdateAssignmentStatus();
  const delMut = useCancelAssignment();

  // Client-side table state for this simple list
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filtered data (search by reviewer name/id, assignment id, status)
  const filtered = useMemo(() => {
    const list = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((x) => {
      const reviewerName = x.reviewer?.userName?.toLowerCase() ?? "";
      const str =
        `${x.id} ${x.submissionId} ${x.reviewerId} ${reviewerName} ${statusLabel(x.status)}`.toLowerCase();
      return str.includes(q);
    });
  }, [data, search]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil((filtered.length || 1) / limit));
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  // Per-row actions
  const nextStatus = (cur: number | undefined): AssignmentStatus => {
    if (!cur) return AssignmentStatus.InProgress;
    if (cur >= AssignmentStatus.Completed) return AssignmentStatus.Completed;
    return (cur + 1) as AssignmentStatus;
  };

  const columns: ColumnDef<ReviewerAssignmentResponseDTO>[] = [
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
      meta: { title: "Mã phân công" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã phân công" />
      ),
    },
    {
      accessorKey: "submissionId",
      meta: { title: "Submission" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submission" />
      ),
    },
    {
      accessorKey: "reviewerId",
      meta: { title: "Reviewer" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reviewer" />
      ),
      cell: ({ row }) => {
        const r = row.original;
        return r.reviewer?.userName
          ? `${r.reviewer.userName} (#${r.reviewerId})`
          : `#${r.reviewerId}`;
      },
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => statusLabel(row.original.status),
    },
    {
      accessorKey: "assignedAt",
      meta: { title: "Ngày phân công" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày phân công" />
      ),
      cell: ({ row }) => <DataTableDate date={row.original.assignedAt} />,
    },
    {
      accessorKey: "deadline",
      meta: { title: "Deadline" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deadline" />
      ),
      cell: ({ row }) =>
        row.original.deadline ? <DataTableDate date={row.original.deadline} /> : "--",
    },
    {
      id: "actions",
      header: () => (
        <span className="flex items-center justify-center">Thao tác</span>
      ),
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={updMut.isPending}
              onClick={() =>
                updMut.mutate(
                  { assignmentId: a.id, status: nextStatus(a.status) },
                  {
                    onSuccess: () => toast.success("Đã cập nhật trạng thái"),
                  }
                )
              }
            >
              Tiến bước
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={delMut.isPending}
              onClick={() =>
                delMut.mutate(a.id, {
                  onSuccess: () => toast.success("Đã huỷ phân công"),
                })
              }
            >
              Huỷ
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Theo dõi phân công</h1>

      {/* Search submissionId */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nhập Submission ID rồi Enter hoặc Search"
          value={submissionInput}
          onChange={(e) => setSubmissionInput(e.target.value)}
          onKeyDown={onKey}
          className="max-w-xs"
        />
        <Button onClick={doSearch}>Search</Button>
      </div>

      {!paramId && (
        <p className="text-sm text-gray-500">
          Vui lòng nhập <b>Submission ID</b> để xem danh sách reviewer đã được phân công.
        </p>
      )}

      {paramId && isLoading && <LoadingPage />}

      {paramId && error && (
        <div className="text-red-600">Không thể tải assignments: {error.message}</div>
      )}

      {paramId && !isLoading && (
        <DataTable<ReviewerAssignmentResponseDTO, unknown>
          data={paged}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={search}
          setSearch={setSearch}
          placeholder="Tìm theo mã, reviewer, trạng thái..."
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          limit={limit}
          setLimit={setLimit}
        />
      )}
    </div>
  );
}
