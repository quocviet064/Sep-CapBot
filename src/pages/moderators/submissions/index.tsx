import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionTable from "./SubmissionTable";
import { useSubmissions } from "@/hooks/useSubmission";
import type { SubmissionListItem } from "@/services/submissionService";

export default function SubmissionsListPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch, isFetching } = useSubmissions({
    PageNumber: page,
    PageSize: pageSize,
    Keyword: debouncedSearch || undefined,
  });

  const rows = useMemo<SubmissionListItem[]>(
    () => (Array.isArray(data?.listObjects) ? data!.listObjects : []),
    [data]
  );

  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const totalRecords = data?.paging?.totalRecord ?? null;

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch {
      /* ignore */
    }
  };

  const handleView = (row: SubmissionListItem) => {
    navigate(`/moderators/submissions/${row.id}`, { state: { row } });
  };

  return (
    // NOTE: use w-full so it fills the content column. If you want to center with bigger max width, change to 'max-w-[1100px] w-full mx-auto'
    <div className="w-full px-4 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Submissions</h1>
          <div className="text-sm text-slate-500" id="totalInfo">
            {isFetching
              ? "Đang tải…"
              : totalRecords != null
              ? `${totalRecords} kết quả • Trang ${page} / ${totalPages}`
              : "Đang tải…"}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-2 rounded-md bg-teal-500 text-white text-sm"
            id="refreshBtn"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* card: make it full-width within content and allow horizontal scroll if table too wide */}
      <div className="bg-white border border-slate-200 rounded-md mt-4 p-4 w-full overflow-x-auto">
        <div className="flex items-center gap-3 mb-3">
          <input
            id="search"
            type="search"
            placeholder="Tìm theo mã / người nộp / vòng nộp..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (page !== 1) setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 min-w-[260px] text-sm"
          />

          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              const v = Number(e.target.value) || 10;
              setPageSize(v);
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 text-sm"
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
          </select>

          <div className="ml-auto text-sm text-slate-500" id="statusNote">
            {isFetching ? "Đang cập nhật..." : "Sẵn sàng"}
          </div>
        </div>

        {/* SubmissionTable nằm trong vùng cho phép mở rộng */}
        <SubmissionTable
          rows={rows}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          onViewDetail={handleView}
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            id="prevBtn"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>

          <div className="text-sm text-slate-500" id="pageInfo">
            {page} / {totalPages}
          </div>

          <button
            id="nextBtn"
            className="px-3 py-2 rounded-md border text-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-3 text-sm text-slate-500">Đang tải dữ liệu...</div>
      )}
    </div>
  );
}
