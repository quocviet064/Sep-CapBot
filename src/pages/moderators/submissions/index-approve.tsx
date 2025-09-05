import { useState } from "react";
import { PlusSquare } from "lucide-react";
import SubmissionTable from "./SubmissionTable";
import SubmissionDetailDialog from "./SubmissionDetailDialog";

export default function SubmissionApprovePage() {
  const [detailId, setDetailId] = useState<number | string | null>(null);

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
              <h2 className="text-lg font-semibold">Xét duyệt submission</h2>
              <p className="text-xs text-white/70">
                Danh sách đề tài đã nộp để Moderator xem lịch sử đánh giá và đưa ra quyết định
              </p>
            </div>
          </div>
          <div />
        </div>
      </div>

      {/* Bảng dùng chung */}
      <SubmissionTable
        mode="approve"
        title="Danh sách submissions"
        placeholder="Tìm theo mã / người nộp / vòng nộp..."
        onViewDetail={(id) => setDetailId(id)}
      />

      {/* Dialog chi tiết submission */}
      <SubmissionDetailDialog
        isOpen={detailId != null}
        onClose={() => setDetailId(null)}
        submissionId={detailId ?? ""}
      />
    </div>
  );
}
