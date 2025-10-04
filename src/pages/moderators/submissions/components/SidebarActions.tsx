import { useMemo, useState } from "react";
import { formatDateTime } from "@/utils/formatter";

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
  submissionId?: string | number;
  onRemoveAssignment?: (assignmentId: number | string) => void;
  reviewSummary?: any | null;
  isAssignDisabled?: boolean;
  remainingSlots?: number;
  isEscalated?: boolean;
  onOpenReviewForSubmission?: (submissionId?: number | string) => void;
};

function initials(name?: string) {
  if (!name) return "U";
  const parts = name?.trim?.().split?.(/\s+/) ?? [];
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function statusBadgeStyle(status?: unknown) {
  const s = String(status ?? "").toLowerCase();
  if (!s) {
    return {
      background: "#f8fafc",
      color: "#0f172a",
    };
  }
  if (s.includes("assigned") || s.includes("active")) return { background: "#ecfdf5", color: "#166534" };
  if (s.includes("pending")) return { background: "#fff7ed", color: "#92400e" };
  if (s.includes("completed")) return { background: "#ecfdf5", color: "#166534" };
  if (s.includes("in progress") || s.includes("in_progress") || s.includes("progress")) return { background: "#fffbeb", color: "#92400e" };
  if (s.includes("overdue") || s.includes("late")) return { background: "#fff1f2", color: "#9f1239" };
  return { background: "#f8fafc", color: "#0f172a" };
}

function mapRecommendationToText(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) {
    const n = Number(val);
    if (n === 1) return "Chấp nhận";
    if (n === 2) return "Cần sửa";
    if (n === 3) return "Cần sửa";
    if (n === 4) return "Từ chối";
    return String(n);
  }
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    if (v === "approve" || v === "accepted" || v === "accept" || v.includes("chấp nhận") || v.includes("đồng ý")) return "Approve";
    if (v.includes("minor") || v.includes("Cần sửa")) return "Minor";
    if (v.includes("major") || v.includes("Cần sửa")) return "Major";
    if (v === "reject" || v === "rejected" || v === "decline" || v.includes("từ chối")) return "Reject";
    return val.trim();
  }
  if (typeof val === "object") {
    try {
      const o: any = val as any;
      const candidates = [o.value, o.name, o.id, o.label, o.type];
      for (const c of candidates) {
        const t = mapRecommendationToText(c);
        if (t) return t;
      }
    } catch {}
  }
  return null;
}

function recBadgeForText(txt?: string | null | undefined) {
  const t = (txt ?? "").toString().toLowerCase();
  if (!t) return { label: "—", style: { background: "#f1f5f9", color: "#475569" } };
  if (t.includes("approve") || t.includes("accept") || t.includes("chấp nhận")) {
    return { label: "Duyệt", style: { background: "#ecfdf5", color: "#166534" } };
  }
  if (t.includes("minor") || t.includes("Cần sửa")) {
    return { label: "Cần sửa", style: { background: "#fffbeb", color: "#92400e" } };
  }
  if (t.includes("major") || t.includes("Cần sửa")) {
    return { label: "Cần sửa", style: { background: "#fff7ed", color: "#92400e" } };
  }
  if (t.includes("reject") || t.includes("decline") || t.includes("từ chối")) {
    return { label: "Từ chối", style: { background: "#fff1f2", color: "#9f1239" } };
  }
  return { label: String(txt), style: { background: "#f1f5f9", color: "#475569" } };
}

function buildRecommendationMap(summary: any): Record<string | number, string | null> {
  if (!summary) return {};
  const s = summary?.data ?? summary?.result ?? summary ?? null;

  let reviewsArr: any[] = [];
  if (!s) return {};
  if (Array.isArray(s)) reviewsArr = s;
  else if (Array.isArray(s.reviews)) reviewsArr = s.reviews;
  else if (Array.isArray(s.reviewList)) reviewsArr = s.reviewList;
  else if (Array.isArray(s.items)) reviewsArr = s.items;
  else if (Array.isArray(s.data)) reviewsArr = s.data;
  else if (Array.isArray(s.result)) reviewsArr = s.result;
  else reviewsArr = [];

  const map: Record<string | number, string | null> = {};
  for (const r of reviewsArr) {
    const reviewerId = r.reviewerId ?? r.reviewer_id ?? (r.reviewer && (r.reviewer.id ?? r.reviewer.reviewerId)) ?? null;
    const rawRec = r.recommendation ?? r.Recommendation ?? r.recommend ?? r.recommendationText ?? r.recommendation_value ?? r.recommendationValue ?? null;
    const parsed = mapRecommendationToText(rawRec);
    if (reviewerId != null) {
      map[String(reviewerId)] = parsed;
    } else {
      const rev = r.reviewer ?? r.reviewerInfo ?? null;
      const rid = rev?.id ?? rev?.reviewerId ?? rev?.userId ?? null;
      if (rid != null) map[String(rid)] = parsed;
    }
  }
  return map;
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
  onRemoveAssignment,
  reviewSummary,
  isAssignDisabled = false,
  isEscalated = false,
  onOpenReviewForSubmission,
}: Props) {
  const [open, setOpen] = useState(true);

  const assigned = assignments ?? [];
  const assignedCount = assigned.length;
  const recommendationMap = useMemo(() => buildRecommendationMap(reviewSummary), [reviewSummary]);

  const handleRemoveClick = (assignmentId: number | string) => {
    const ok = window.confirm("Bạn có chắc muốn huỷ phân công reviewer này không? Hành động không thể hoàn tác.");
    if (!ok) return;
    if (typeof onRemoveAssignment === "function") {
      onRemoveAssignment(assignmentId);
    } else {
      console.warn("onRemoveAssignment not provided, cannot remove assignment", assignmentId);
    }
  };

  const handleOpenReviewClick = (assignment: Assignment) => {
    const sidForAssign = assignment?.submissionId ?? assignment?.submission?.id ?? null;
    if (typeof onOpenReviewForSubmission === "function") {
      onOpenReviewForSubmission(sidForAssign ?? undefined);
    } else {
      toggleShowReviews();
    }
  };

  return (
    <>
      {/* slider card */}
      <div className="rounded-md border bg-gradient-to-b from-white to-[#fbffff] overflow-hidden">
        <button
          type="button"
          aria-expanded={open}
          className="w-full px-3 py-2 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-300"
          onClick={() => setOpen((s) => !s)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-semibold text-sm">Assigned reviewers</div>
            <div className="text-sm text-slate-500">{assignedCount}</div>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 text-slate-500 transform transition-transform ${open ? "rotate-180" : "rotate-0"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        <div
          className="px-3 pt-2 pb-3 border-t transition-all"
          style={{
            maxHeight: open ? 420 : 0,
            overflow: "hidden",
            transition: "max-height .28s ease, opacity .18s ease",
            opacity: open ? 1 : 0,
          }}
        >
          {loadingAssignments ? (
            <div className="text-sm text-slate-500 py-6">Đang tải danh sách reviewers…</div>
          ) : assigned.length > 0 ? (
            <div className="flex flex-col gap-2" style={{ maxHeight: 360, overflowY: "auto", paddingRight: 6 }}>
              {assigned.map((a: Assignment) => {
                const displayTopic =
                  a.displayTopic ??
                  (a.topic
                    ? {
                        id: a.topic.id,
                        eN_Title: a.topic.eN_Title ?? a.topic.eNTitle ?? a.topic.title,
                        vN_title: a.topic.vN_title ?? a.topic.vNTitle ?? a.topic.vNTitle,
                        description: a.topic.description,
                        documentUrl: a.topic.documentUrl ?? a.topic.document_url,
                      }
                    : a.topicVersion
                    ? {
                        id: a.topicVersion.id,
                        eN_Title: a.topicVersion.eN_Title ?? a.topicVersion.title,
                        vN_title: a.topicVersion.vN_title,
                        description: a.topicVersion.description,
                        documentUrl: a.topicVersion.documentUrl ?? a.topicVersion.document_url,
                      }
                    : null);

                const displayTopicSource = a.displayTopicSource ?? (a.topicVersion ? "topicVersion" : "topic");
                const name = a.reviewer?.userName ?? a.reviewerName ?? `#${a.reviewerId ?? ""}`;
                const reviewerIdKey = a.reviewer?.id ?? a.reviewerId ?? a.reviewer?.reviewerId ?? null;
                const badge = statusBadgeStyle(a.status);
                const recText = reviewerIdKey != null ? recommendationMap[String(reviewerIdKey)] ?? null : null;
                const recBadge = recBadgeForText(recText);

                const isForCurrentSubmission = submissionId != null && String(a.submissionId ?? a.submission?.id ?? "") === String(submissionId);
                const isCurrent = typeof a.isCurrent === "boolean" ? a.isCurrent : isForCurrentSubmission;

                return (
                  <div
                    key={String(a.id ?? `${a.reviewerId ?? Math.random()}`)}
                    className="border rounded p-3 flex items-center justify-between bg-white"
                    title={name}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {initials(a.reviewer?.userName ?? a.reviewerName ?? `${a.reviewerId ?? ""}`)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          <span>{name}</span>

                          {/* recommendation small badge */}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              ...recBadge.style,
                            }}
                          >
                            {recBadge.label}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {a.deadline ? `Deadline: ${formatDateTime(a.deadline)}` : ""}
                        </div>

                        {/* If assignment not for current submission, show indicator */}
                        {!isCurrent && a.submissionId != null && (
                          <div className="mt-1 text-xs text-amber-600">Review belongs to submission #{a.submissionId}</div>
                        )}
                        {!isCurrent && !a.submissionId && a.topicVersionId && (
                          <div className="mt-1 text-xs text-amber-600">Review belongs to topic version #{a.topicVersionId}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontWeight: 500,
                          border: "1px solid rgba(15,23,42,0.06)",
                          background: badge.background,
                          color: badge.color,
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

                      {/* remove icon/button */}
                      {a.id != null && onRemoveAssignment ? (
                        <button
                          type="button"
                          title="Huỷ phân công"
                          onClick={() => handleRemoveClick(a.id)}
                          className="ml-1 inline-flex items-center justify-center w-8 h-8 rounded border hover:bg-red-50"
                          aria-label={`Remove assignment ${a.id}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-500 py-3">No reviewers assigned.</div>
          )}
        </div>
      </div>

      {/* actions card */}
      <div className="bg-white border rounded-md p-4">
        <div className="text-sm font-semibold mb-2">Chức năng</div>
        <div className="flex flex-col gap-2">
          <button className="rounded border px-3 py-2 text-sm text-left" onClick={toggleShowReviews} type="button">
            {showReviews ? "Ẩn đánh giá" : "Xem đánh giá"}
          </button>

          <button
            className="rounded border px-3 py-2 text-sm text-left"
            onClick={onOpenPicker}
            title={!submissionId ? "Vui lòng mở chi tiết submission trước" : isAssignDisabled ? "Đã đủ reviewer, không thể phân công thêm" : "Phân công reviewer"}
            type="button"
          >
            Chỉ định giảng viên
          </button>

          <button className="rounded border px-3 py-2 text-sm text-left" onClick={onOpenSuggestions} disabled={!submissionId} type="button">
            Gợi ý giảng viên (AI)
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
            disabled={!submissionId || !isEscalated}
            title={
              !submissionId ? "Vui lòng mở chi tiết submission trước" : !isEscalated ? "Chỉ khả dụng khi submission ở trạng thái EscalatedToModerator" : "Quyết định cuối (Moderator)"
            }
            type="button"
          >
            Quyết định cuối
          </button>
        </div>
      </div>
    </>
  );
}
