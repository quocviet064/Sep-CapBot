import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionTable from "./SubmissionTable";
import { useSubmissions } from "@/hooks/useSubmission";
import type { SubmissionListItem } from "@/services/submissionService";

export default function SubmissionsListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading } = useSubmissions({
    PageNumber: page,
    PageSize: pageSize,
    Keyword: search || undefined,
  });

  const rows = useMemo<SubmissionListItem[]>(
    () => (Array.isArray(data?.listObjects) ? data!.listObjects : []),
    [data]
  );
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-3 text-lg font-semibold">Submissions</div>

      <SubmissionTable
        mode="approve"
        rows={rows}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        search={search}
        setSearch={setSearch}
        onViewDetail={(row) => {
          navigate(`/moderators/submissions/${row.id}`, { state: { row } });
        }}
        // onAssignReviewer: không dùng ở list nữa
        placeholder="Tìm theo mã / người nộp / vòng nộp..."
      />

      {isLoading && (
        <div className="mt-3 text-sm opacity-70">Đang tải dữ liệu...</div>
      )}
    </div>
  );
}
