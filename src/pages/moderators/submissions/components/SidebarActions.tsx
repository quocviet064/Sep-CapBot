import React, { useMemo, useState } from "react";

type Assignment = any;

type Props = {
  assignments?: Assignment[] | undefined;
  loadingAssignments?: boolean;
  showReviews: boolean;
  toggleShowReviews: () => void;
  onOpenPicker: () => void;
  onOpenSuggestions: () => void;
  onOpenAssignments: () => void;
  onOpenFinalReview?: () => void;
  submissionId?: string;
};

function initials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  onOpenFinalReview,
  submissionId,
}: Props) {
  const [open, setOpen] = useState(true);

  const assigned = assignments ?? [];
  const assignedCount = assigned.length;

  return (
    <>
      {/* slider card */}
      <div className="rounded-md border bg-gradient-to-b from-white to-[#fbffff] overflow-hidden">
        <div
          className="px-3 py-2 flex items-center justify-between cursor-pointer"
          onClick={() => setOpen((s) => !s)}
        >
          <div className="flex items-center gap-3">
            <div className="font-semibold text-sm">Assigned reviewers</div>
            <div className="text-sm text-slate-500">{assignedCount}</div>
          </div>
        </div>

        <div
          className="px-3 pt-2 pb-3 border-t transition-all"
          style={{
            maxHeight: open ? 480 : 0,
            overflow: "hidden",
            transition: "max-height .28s ease",
          }}
        >
          {loadingAssignments ? (
            <div className="text-sm text-slate-500 py-4">Đang tải danh sách reviewers…</div>
          ) : assigned.length > 0 ? (
            <div className="flex flex-col gap-2">
              {assigned.map((a: Assignment) => (
                <div
                  key={String(a.id ?? `${a.reviewerId ?? Math.random()}`)}
                  className="border rounded p-3 flex items-center justify-between bg-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm">
                      {initials(a.reviewer?.userName ?? a.reviewerName ?? `${a.reviewerId ?? ""}`)}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {a.reviewer?.userName ?? a.reviewerName ?? `#${a.reviewerId ?? ""}`}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {a.assignmentType === 1
                          ? "Primary"
                          : a.assignmentType === 2
                            ? "Secondary"
                            : a.assignmentType === "primary"
                              ? "Primary"
                              : a.assignmentType === "secondary"
                                ? "Secondary"
                                : "Additional"}
                        {a.deadline ? ` • Deadline: ${fmtDate(a.deadline)}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    {/* status badge */}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontWeight: 700,
                        border: "1px solid rgba(15,23,42,0.06)",
                        background: (String(a.status ?? "")).toLowerCase().includes("assigned")
                          ? "#ecfdf5"
                          : (String(a.status ?? "")).toLowerCase().includes("pending")
                            ? "#fff7ed"
                            : "#f8fafc",
                        color: (String(a.status ?? "")).toLowerCase().includes("assigned")
                          ? "#166534"
                          : (String(a.status ?? "")).toLowerCase().includes("pending")
                            ? "#92400e"
                            : "#0f172a",
                      }}
                    >
                      {typeof a.status === "number"
                        ? a.status === 1
                          ? "Assigned"
                          : a.status === 2
                            ? "In progress"
                            : a.status === 3
                              ? "Completed"
                              : "Overdue"
                        : a.status ?? "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No reviewers assigned.</div>
          )}
        </div>
      </div>

      {/* actions card */}
      <div className="bg-white border rounded-md p-4">
        <div className="text-sm font-semibold mb-2">Quick actions</div>
        <div className="flex flex-col gap-2">
          <button
            className="rounded border px-3 py-2 text-sm text-left"
            onClick={toggleShowReviews}
            type="button"
          >
            {showReviews ? "Ẩn đánh giá" : "Xem đánh giá"}
          </button>

          <button
            className="rounded border px-3 py-2 text-sm text-left"
            onClick={onOpenPicker}
            disabled={!submissionId}
            type="button"
          >
            Assign reviewers
          </button>

          <button
            className="rounded border px-3 py-2 text-sm text-left"
            onClick={onOpenSuggestions}
            disabled={!submissionId}
            type="button"
          >
            Gợi ý reviewer (AI)
          </button>

          <button
            className="rounded border px-3 py-2 text-sm text-left"
            onClick={onOpenAssignments}
            disabled={
              !submissionId ||
              Boolean(loadingAssignments) ||
              (assigned.length === 0)
            }
            type="button"
          >
            Manage assignments
          </button>

          <button
            className="rounded border px-3 py-2 text-sm text-left"
            onClick={() => window.alert("Download doc (mock)")}
            type="button"
          >
            Download document (mock)
          </button>

          <button
            className="rounded border px-3 py-2 text-sm text-left bg-red-50 hover:bg-red-100"
            onClick={() => {
              try {
                if (!submissionId) {
                  console.warn("SidebarActions: onOpenFinalReview clicked but submissionId is falsy", submissionId);
                }
                onOpenFinalReview?.();
              } catch (err) {
                console.error("Error when invoking onOpenFinalReview", err);
              }
            }}
            disabled={!submissionId}
            title={!submissionId ? "Vui lòng mở chi tiết submission trước" : "Quyết định cuối (Moderator)"}
            type="button"
          >
            Final decision
          </button>
        </div>
      </div>
    </>
  );
}
