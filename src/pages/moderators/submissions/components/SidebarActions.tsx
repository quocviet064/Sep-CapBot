import { useMemo, useState } from "react";
import { formatDateTime } from "@/utils/formatter";

type ID = number | string;

type ReviewerRef = {
  id?: ID | null;
  reviewerId?: ID | null;
  userId?: ID | null;
  userName?: string | null;
};

type Assignment = {
  id?: ID | null;
  reviewerId?: ID | null;
  reviewer?: ReviewerRef | null;
  reviewerName?: string | null;
  status?: string | number | null;
  deadline?: string | Date | null;
  submissionId?: ID | null;
  submission?: { id?: ID | null } | null;
  isCurrent?: boolean | null;
  topicVersionId?: ID | null;
};

type Props = {
  assignments?: Assignment[] | undefined;
  loadingAssignments?: boolean;
  showReviews: boolean;
  toggleShowReviews: () => void;
  onOpenPicker: () => void;
  onOpenSuggestions: () => void;
  onOpenFinalReview?: () => void;
  onOpenAssignments?: () => void | Promise<void>;
  submissionId?: ID;
  onRemoveAssignment?: (assignmentId: ID) => void;
  reviewSummary?: unknown | null;
  isAssignDisabled?: boolean;
  remainingSlots?: number;
  isEscalated?: boolean;
  onOpenReviewForSubmission?: (submissionId?: ID) => void;
};

function initials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function statusBadgeStyle(status?: unknown) {
  const s = String(status ?? "").toLowerCase();
  if (!s) return { background: "#f8fafc", color: "#0f172a" };
  if (s.includes("assigned") || s.includes("active"))
    return { background: "#ecfdf5", color: "#166534" };
  if (s.includes("pending")) return { background: "#fff7ed", color: "#92400e" };
  if (s.includes("completed"))
    return { background: "#ecfdf5", color: "#166534" };
  if (
    s.includes("in progress") ||
    s.includes("in_progress") ||
    s.includes("progress")
  )
    return { background: "#fffbeb", color: "#92400e" };
  if (s.includes("overdue") || s.includes("late"))
    return { background: "#fff1f2", color: "#9f1239" };
  return { background: "#f8fafc", color: "#0f172a" };
}

function mapRecommendationToText(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) {
    const n = Number(val);
    if (n === 1) return "Chấp nhận";
    if (n === 2 || n === 3) return "Cần sửa";
    if (n === 4) return "Từ chối";
    return String(n);
  }
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    if (
      v === "approve" ||
      v === "accepted" ||
      v === "accept" ||
      v.includes("chấp nhận") ||
      v.includes("đồng ý")
    )
      return "Approve";
    if (v.includes("minor") || v.includes("cần sửa")) return "Minor";
    if (v.includes("major") || v.includes("cần sửa")) return "Major";
    if (
      v === "reject" ||
      v === "rejected" ||
      v === "decline" ||
      v.includes("từ chối")
    )
      return "Reject";
    return val.trim();
  }
  if (typeof val === "object") {
    const o = val as Record<string, unknown>;
    const candidates = [o.value, o.name, o.id, o.label, o.type];
    for (const c of candidates) {
      const t = mapRecommendationToText(c);
      if (t) return t;
    }
  }
  return null;
}

function recBadgeForText(txt?: string | null | undefined) {
  const t = (txt ?? "").toString().toLowerCase();
  if (!t)
    return { label: "—", style: { background: "#f1f5f9", color: "#475569" } };
  if (t.includes("approve") || t.includes("accept") || t.includes("chấp nhận"))
    return {
      label: "Duyệt",
      style: { background: "#ecfdf5", color: "#166534" },
    };
  if (t.includes("minor") || t.includes("cần sửa"))
    return {
      label: "Cần sửa",
      style: { background: "#fffbeb", color: "#92400e" },
    };
  if (t.includes("major") || t.includes("cần sửa"))
    return {
      label: "Cần sửa",
      style: { background: "#fff7ed", color: "#92400e" },
    };
  if (t.includes("reject") || t.includes("decline") || t.includes("từ chối"))
    return {
      label: "Từ chối",
      style: { background: "#fff1f2", color: "#9f1239" },
    };
  return {
    label: String(txt),
    style: { background: "#f1f5f9", color: "#475569" },
  };
}

function getProp<T = unknown>(obj: unknown, key: string): T | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const v = (obj as Record<string, unknown>)[key];
  return v as T | undefined;
}

function firstArrayLike(obj: unknown): unknown[] {
  if (Array.isArray(obj)) return obj;
  const keys = ["reviews", "reviewList", "items", "data", "result"];
  for (const k of keys) {
    const v = getProp(obj, k);
    if (Array.isArray(v)) return v as unknown[];
  }
  return [];
}

function buildRecommendationMap(
  summary: unknown,
): Record<string | number, string | null> {
  const roots = [summary, getProp(summary, "data"), getProp(summary, "result")];
  let reviewsArr: unknown[] = [];
  for (const r of roots) {
    reviewsArr = firstArrayLike(r);
    if (reviewsArr.length) break;
  }
  const map: Record<string | number, string | null> = {};
  for (const r of reviewsArr) {
    const obj = (r ?? {}) as Record<string, unknown>;
    const reviewerId =
      obj.reviewerId ??
      (obj as Record<string, unknown>)["reviewer_id"] ??
      getProp(getProp(obj, "reviewer"), "id") ??
      getProp(getProp(obj, "reviewer"), "reviewerId");
    const rawRec =
      obj.recommendation ??
      (obj as Record<string, unknown>)["Recommendation"] ??
      (obj as Record<string, unknown>)["recommend"] ??
      (obj as Record<string, unknown>)["recommendationText"] ??
      (obj as Record<string, unknown>)["recommendation_value"] ??
      (obj as Record<string, unknown>)["recommendationValue"];
    const parsed = mapRecommendationToText(rawRec);
    if (reviewerId != null) map[String(reviewerId as ID)] = parsed;
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
  onOpenFinalReview,
  onOpenAssignments,
  submissionId,
  onRemoveAssignment,
  reviewSummary,
  isAssignDisabled = false,
  isEscalated = false,
}: Props) {
  const [open, setOpen] = useState(true);

  const assigned = assignments ?? [];
  const assignedCount = assigned.length;
  const recommendationMap = useMemo(
    () => buildRecommendationMap(reviewSummary),
    [reviewSummary],
  );

  const handleRemoveClick = (assignmentId: ID) => {
    const ok = window.confirm(
      "Bạn có chắc muốn huỷ phân công reviewer này không? Hành động không thể hoàn tác.",
    );
    if (!ok) return;
    if (onRemoveAssignment) onRemoveAssignment(assignmentId);
  };

  return (
    <>
      <div className="overflow-hidden rounded-md border bg-gradient-to-b from-white to-[#fbffff]">
        <button
          type="button"
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between px-3 py-2 focus:ring-2 focus:ring-sky-300 focus:ring-offset-1 focus:outline-none"
          onClick={() => setOpen((s) => !s)}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="text-sm font-semibold">Assigned reviewers</div>
            <div className="text-sm text-slate-500">{assignedCount}</div>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 transform text-slate-500 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
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
          className="border-t px-3 pt-2 pb-3 transition-all"
          style={{
            maxHeight: open ? 420 : 0,
            overflow: "hidden",
            transition: "max-height .28s ease, opacity .18s ease",
            opacity: open ? 1 : 0,
          }}
        >
          {loadingAssignments ? (
            <div className="py-6 text-sm text-slate-500">
              Đang tải danh sách reviewers…
            </div>
          ) : assigned.length > 0 ? (
            <div
              className="flex flex-col gap-2"
              style={{ maxHeight: 360, overflowY: "auto", paddingRight: 6 }}
            >
              {assigned.map((a) => {
                const name =
                  a.reviewer?.userName ??
                  a.reviewerName ??
                  `#${a.reviewerId ?? ""}`;
                const reviewerIdKey =
                  a.reviewer?.id ??
                  a.reviewerId ??
                  a.reviewer?.reviewerId ??
                  null;
                const badge = statusBadgeStyle(a.status);
                const recText =
                  reviewerIdKey != null
                    ? (recommendationMap[String(reviewerIdKey)] ?? null)
                    : null;
                const recBadge = recBadgeForText(recText);
                const isForCurrentSubmission =
                  submissionId != null &&
                  String(a.submissionId ?? a.submission?.id ?? "") ===
                    String(submissionId);
                const isCurrent =
                  typeof a.isCurrent === "boolean"
                    ? a.isCurrent
                    : isForCurrentSubmission;

                return (
                  <div
                    key={String(a.id ?? `${a.reviewerId ?? Math.random()}`)}
                    className="flex items-center justify-between rounded border bg-white p-3"
                    title={name}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">
                        {initials(
                          a.reviewer?.userName ??
                            a.reviewerName ??
                            `${a.reviewerId ?? ""}`,
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate font-medium">
                          <span>{name}</span>
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
                        <div className="mt-1 text-xs text-slate-500">
                          {a.deadline
                            ? `Deadline: ${formatDateTime(a.deadline)}`
                            : ""}
                        </div>
                        {!isCurrent && a.submissionId != null && (
                          <div className="mt-1 text-xs text-amber-600">
                            Review belongs to submission #{a.submissionId}
                          </div>
                        )}
                        {!isCurrent && !a.submissionId && a.topicVersionId && (
                          <div className="mt-1 text-xs text-amber-600">
                            Review belongs to topic version #{a.topicVersionId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-3 flex flex-shrink-0 items-center gap-2">
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
                          : (a.status ?? "—")}
                      </span>

                      {a.id != null && onRemoveAssignment ? (
                        <button
                          type="button"
                          title="Huỷ phân công"
                          onClick={() => handleRemoveClick(a.id as ID)}
                          className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded border hover:bg-red-50"
                          aria-label={`Remove assignment ${a.id}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-rose-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-3 text-sm text-slate-500">
              No reviewers assigned.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-white p-4">
        <div className="mb-2 text-sm font-semibold">Chức năng</div>
        <div className="flex flex-col gap-2">
          <button
            className="rounded border px-3 py-2 text-left text-sm"
            onClick={toggleShowReviews}
            type="button"
          >
            {showReviews ? "Ẩn đánh giá" : "Xem đánh giá"}
          </button>
          <button
            className="rounded border px-3 py-2 text-left text-sm"
            onClick={onOpenPicker}
            disabled={!submissionId || isAssignDisabled}
            title={
              !submissionId
                ? "Vui lòng mở chi tiết submission trước"
                : isAssignDisabled
                  ? "Đã đủ reviewer, không thể phân công thêm"
                  : "Phân công reviewer"
            }
            type="button"
          >
            Chỉ định giảng viên
          </button>
          <button
            className="rounded border px-3 py-2 text-left text-sm"
            onClick={onOpenSuggestions}
            disabled={!submissionId}
            type="button"
          >
            Gợi ý giảng viên (AI)
          </button>
          <button
            className="rounded border bg-red-50 px-3 py-2 text-left text-sm hover:bg-red-100"
            onClick={() => onOpenFinalReview?.()}
            disabled={!submissionId || !isEscalated}
            title={
              !submissionId
                ? "Vui lòng mở chi tiết submission trước"
                : !isEscalated
                  ? "Chỉ khả dụng khi submission ở trạng thái EscalatedToModerator"
                  : "Quyết định cuối (Moderator)"
            }
            type="button"
          >
            Quyết định cuối
          </button>
          {onOpenAssignments && (
            <button
              className="rounded border px-3 py-2 text-left text-sm"
              onClick={() => onOpenAssignments()}
              type="button"
            >
              Làm mới phân công
            </button>
          )}
        </div>
      </div>
    </>
  );
}
