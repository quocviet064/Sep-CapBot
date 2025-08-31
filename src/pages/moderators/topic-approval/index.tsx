import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusSquare } from "lucide-react";
import { DataTable } from "@/components/globals/atoms/data-table";
import LoadingPage from "@/pages/loading-page";

import { useSubmissions } from "@/hooks/useSubmission";
import { createColumns } from "./columns";
import type {
  SubmissionListItem,
  RawSubmissionResponse,
} from "@/services/submissionService";

const DEFAULT_VISIBILITY = {
  id: true,
  submittedByName: true,
  submissionRound: true,
  submittedAt: true,
} as const;

export default function SubmissionApprovalIndexPage() {
  const navigate = useNavigate();

  // Paging + search
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // (Optional) filter khác nếu cần
  const [semesterId] = useState<number | undefined>(undefined);
  const [phaseId] = useState<number | undefined>(undefined);
  const [status] = useState<string | undefined>(undefined);

  const query = useSubmissions({
    TopicVersionId: undefined,
    PhaseId: phaseId,
    SemesterId: semesterId,
    Status: status,
    PageNumber: pageNumber,
    PageSize: pageSize,
    Keyword: searchTerm,
  });

  // Handlers & columns MUST be declared before any conditional return
  const onViewDetail = useCallback(
    (submissionId: number | string) => {
      navigate(`/moderators/topic-approval/${submissionId}`);
    },
    [navigate]
  );

  const onAssignReviewer = useCallback(
    (submissionId: number | string) => {
      navigate(`/moderators/reviewer-assignment?submissionId=${submissionId}`);
    },
    [navigate]
  );

  const columns = useMemo(
    () => createColumns({ onViewDetail, onAssignReviewer }),
    [onViewDetail, onAssignReviewer]
  );

  // Safe to return after all hooks above have been called
  if (query.isLoading) return <LoadingPage />;
  if (query.error)
    return <div className="p-4 text-red-600">Error: {query.error.message}</div>;

  const resp = (query.data as RawSubmissionResponse | undefined) ?? undefined;
  const rows: SubmissionListItem[] = resp?.listObjects ?? [];
  const totalPages = resp?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <PlusSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Duyệt submission</h2>
              <p className="text-xs text-white/70">
                Danh sách đề tài đã nộp (submission) cho Moderator xử lý
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Tổng trang
              </div>
              <div className="text-sm font-semibold">{totalPages}</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Bản ghi trang hiện tại
              </div>
              <div className="text-sm font-semibold">{rows.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-[520px] rounded-2xl border bg-white/70 px-4 py-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold">Danh sách submissions</h3>
        <DataTable<SubmissionListItem, unknown>
          data={rows}
          columns={columns as any}
          visibility={DEFAULT_VISIBILITY as any}
          search={searchTerm}
          setSearch={(v) => {
            setSearchTerm(v);
            setPageNumber(1);
          }}
          placeholder="Tìm theo mã / người nộp / vòng nộp..."
          page={pageNumber}
          setPage={setPageNumber}
          totalPages={totalPages}
          limit={pageSize}
          setLimit={setPageSize}
        />
      </div>
    </div>
  );
}
