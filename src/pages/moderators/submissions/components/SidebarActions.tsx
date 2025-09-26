// src/pages/moderators/submissions/components/SidebarActions.tsx
import React from "react";

type Assignment = any;

type Props = {
  assignments?: Assignment[] | undefined;
  loadingAssignments?: boolean;
  showReviews: boolean;
  toggleShowReviews: () => void;
  onOpenPicker: () => void;
  onOpenSuggestions: () => void;
  onOpenAssignments: () => void;
  submissionId?: string;
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleString();
  } catch {
    return d;
  }
}

export default function SidebarActions({
  assignments,
  loadingAssignments,
  showReviews,
  toggleShowReviews,
  onOpenPicker,
  onOpenSuggestions,
  onOpenAssignments,
  submissionId,
}: Props) {
  return (
    <>
      <div className="bg-white border rounded-md p-4">
        <div className="text-sm font-semibold mb-2">Reviewers</div>
        {loadingAssignments ? (
          <div className="text-sm text-slate-500">Đang tải danh sách reviewers…</div>
        ) : assignments && assignments.length > 0 ? (
          <div className="space-y-2">
            {assignments.map((a) => (
              <div key={String(a.id)} className="border rounded p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.reviewer?.userName ?? `#${a.reviewerId}`}</div>
                  <div className="text-xs text-slate-500">
                    {a.assignmentType === 1 ? "Primary" : a.assignmentType === 2 ? "Secondary" : "Additional"}
                    {a.deadline ? ` • Deadline: ${fmtDate(a.deadline)}` : ""}
                  </div>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {a.status ? (a.status === 1 ? "Assigned" : a.status === 2 ? "In progress" : a.status === 3 ? "Completed" : "Overdue") : "—"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500">No reviewers assigned.</div>
        )}
      </div>

      <div className="bg-white border rounded-md p-4">
        <div className="text-sm font-semibold mb-2">Quick actions</div>
        <div className="flex flex-col gap-2">
          <button className="rounded border px-3 py-2 text-sm text-left" onClick={toggleShowReviews}>
            {showReviews ? "Ẩn đánh giá" : "Xem đánh giá"}
          </button>

          <button className="rounded border px-3 py-2 text-sm text-left" onClick={onOpenPicker} disabled={!submissionId}>
            Assign reviewers
          </button>

          <button className="rounded border px-3 py-2 text-sm text-left" onClick={onOpenSuggestions} disabled={!submissionId}>
            Gợi ý reviewer (AI)
          </button>

          <button className="rounded border px-3 py-2 text-sm text-left" onClick={onOpenAssignments} disabled={!submissionId || loadingAssignments || (assignments?.length ?? 0) === 0}>
            Manage assignments
          </button>

          <button className="rounded border px-3 py-2 text-sm text-left" onClick={() => window.alert("Download doc (mock)")}>
            Download document (mock)
          </button>
        </div>
      </div>
    </>
  );
}