import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionTable from "./SubmissionTable";
import { useSubmissions } from "@/hooks/useSubmission";
import type { SubmissionListItem } from "@/services/submissionService";

export default function SubmissionsListPage() {
  const navigate = useNavigate();

  // paging + search local state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  // call API
  const { data, isLoading } = useSubmissions({
    PageNumber: page,
    PageSize: pageSize,
    Keyword: search || undefined,
  });

  // safe fallbacks
  const rows = useMemo<SubmissionListItem[]>(
    () => (Array.isArray(data?.listObjects) ? data!.listObjects : []),
    [data]
  );
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-3 text-lg font-semibold">Submissions</div>

      {/* Bảng “dumb” đã có fallback an toàn */}
      <SubmissionTable
        mode="approve" // chỉ để hiện nút xem; action Assign sẽ làm ở trang chi tiết
        rows={rows}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        search={search}
        setSearch={setSearch}
        onViewDetail={(row) => {
          // chuyển sang trang chi tiết, mang theo row để dùng làm header tức thì
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
