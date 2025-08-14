import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";
import { createSubmissionColumns } from "./columnsSubmissions";
import { useAllSubmissions } from "@/hooks/useSubmission";

const DEFAULT_VISIBILITY = {
  id: false,
  topicVersionId: true,
  topicTitle: true,
  phaseName: true,
  semesterName: true,
  status: true,
  createdAt: true,
};

export default function SubmissionPage() {
  const [topicVersionId] = useState<number | undefined>(undefined);
  const [phaseId] = useState<number | undefined>(undefined);
  const [semesterId] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Submitted" | "Approved" | "Rejected" | "Draft"
  >("all");

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, isLoading, error } = useAllSubmissions({
    TopicVersionId: topicVersionId,
    PhaseId: phaseId,
    SemesterId: semesterId,
    Status: statusFilter === "all" ? undefined : statusFilter,
    Keyword: searchTerm || undefined,
  });

  const allSubs = data || [];

  const filtered = useMemo(() => {
    return statusFilter === "all"
      ? allSubs
      : allSubs.filter((s) => s.status === statusFilter);
  }, [allSubs, statusFilter]);

  const totalFilteredPages = Math.ceil(filtered.length / pageSize) || 1;
  useEffect(() => setPageNumber(1), [statusFilter, pageSize, searchTerm]);

  const currentPage = filtered.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize,
  );

  const navigate = useNavigate();
  const columns = createSubmissionColumns({
    onViewDetail: (submissionId) => {
      navigate(`/submissions/${submissionId}`);
    },
  });

  if (isLoading) return <LoadingPage />;
  if (error) return <p className="text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="min-h-[600px] rounded-2xl border px-4 py-4">
        <h2 className="mb-4 text-xl font-bold">Danh sách Submission</h2>

        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <button
            className={`rounded-full border px-3 py-1 ${statusFilter === "all" ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setStatusFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={`rounded-full border px-3 py-1 ${statusFilter === "Submitted" ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setStatusFilter("Submitted")}
          >
            Submitted
          </button>
          <button
            className={`rounded-full border px-3 py-1 ${statusFilter === "Approved" ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setStatusFilter("Approved")}
          >
            Approved
          </button>
          <button
            className={`rounded-full border px-3 py-1 ${statusFilter === "Rejected" ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setStatusFilter("Rejected")}
          >
            Rejected
          </button>
          <button
            className={`rounded-full border px-3 py-1 ${statusFilter === "Draft" ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setStatusFilter("Draft")}
          >
            Draft
          </button>
        </div>

        <DataTable
          data={currentPage}
          columns={columns}
          visibility={DEFAULT_VISIBILITY}
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Tìm kiếm submission..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalFilteredPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}
