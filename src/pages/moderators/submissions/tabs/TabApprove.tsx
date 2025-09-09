import { useState } from "react";
import { FileText } from "lucide-react";
import SubmissionTable from "../SubmissionTable";
import SubmissionDetailDialog from "../SubmissionDetailDialog";
import { useSubmissions } from "@/hooks/useSubmission";
import type { RawSubmissionResponse } from "@/services/submissionService";

export default function TabApprove() {
  // local UI state
  const [detailId, setDetailId] = useState<number | string | null>(null);

  // paging + search
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>("");

  // fetch submissions
  const query = useSubmissions({
    PageNumber: page,
    PageSize: pageSize,
    Keyword: search,
  });

  // luôn fallback an toàn
  const resp: RawSubmissionResponse | undefined = query.data ?? undefined;
  const rows = resp?.listObjects ?? [];      // ✅ mảng rỗng khi chưa có data
  const totalPages = resp?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Xét duyệt submission</h2>
            <p className="text-xs text-white/70">
              Danh sách đề tài đã nộp để Moderator xem lịch sử đánh giá và đưa ra quyết định.
            </p>
          </div>
        </div>
      </div>

      {/* Table (dumb) */}
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
        onViewDetail={(id) => setDetailId(id)}
      />

      {/* Dialog chi tiết */}
      <SubmissionDetailDialog
        isOpen={detailId != null}
        onClose={() => setDetailId(null)}
        submissionId={detailId ?? ""}
      />
    </div>
  );
}
