import { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMyAssignments, useStartReview } from "@/hooks/useReviewerAssignment";
import { useWithdrawReview, useReviewStatistics } from "@/hooks/useReview";
import { getReviewsByAssignment } from "@/services/reviewService";
import LoadingPage from "@/pages/loading-page";
import { toast } from "sonner";
import { DataTable } from "@/components/globals/atoms/data-table";
import { Input } from "@/components/globals/atoms/input";
import { createColumns, DEFAULT_VISIBILITY as COL_VIS } from "../columns";

import type { ReviewerAssignmentResponseDTO } from "@/services/reviewerAssignmentService";

const DEFAULT_VISIBILITY = COL_VIS;

const STATUS = {
  ALL: "all",
  ASSIGNED: "assigned",
  INPROGRESS: "inprogress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const;

/** normalize helpers */
const normalize = (v?: unknown) => String(v ?? "").trim();
const toLower = (v?: unknown) => normalize(v).toLowerCase();

/** map statuses to canonical lowercase keys */
const canonicalAssignmentStatus = (s?: unknown) => {
  const k = toLower(s);
  if (!k) return "";
  if (k.includes("assigned")) return "assigned";
  if (k.includes("inprogress") || k.includes("in_progress") || k.includes("in progress"))
    return "inprogress";
  if (k.includes("completed")) return "completed";
  if (k.includes("overdue")) return "overdue";
  return k; // fallback (e.g. draft/submitted etc)
};

export default function ReviewerAssignedList() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useMyAssignments();
  const assignments = data ?? [];

  const { data: reviewStatsResp, isLoading: statsLoading } = useReviewStatistics();
  const reviewList = reviewStatsResp?.listObjects ?? [];

  // build map assignmentId => best review summary (prefer Submitted > Draft > InProgress)
  const reviewByAssignment = useMemo(() => {
    const map = new Map<number | string, any>();
    if (!Array.isArray(reviewList)) return map;

    const prefOrder = (s?: string | null) => {
      const kk = toLower(s);
      if (kk === "submitted") return 3;
      if (kk === "draft") return 2;
      if (kk === "inprogress" || kk === "in_progress" || kk === "in progress") return 1;
      return 0;
    };

    for (const rv of reviewList) {
      const aid =
        rv.assignmentId ??
        (rv as any).AssignmentId ??
        (rv as any).assignment?.id ??
        (rv as any).assignmentId ??
        null;
      if (aid == null) continue;

      const existing = map.get(aid);
      if (!existing) {
        map.set(aid, rv);
        continue;
      }

      const eScore = prefOrder(existing.status);
      const rScore = prefOrder(rv.status);

      if (rScore > eScore) {
        map.set(aid, rv);
      } else if (rScore === eScore) {
        const eTime = new Date(existing.createdAt ?? 0).getTime();
        const rTime = new Date(rv.createdAt ?? 0).getTime();
        if (rTime > eTime) {
          map.set(aid, rv);
        }
      }
    }
    return map;
  }, [reviewList]);

  const enrichedAssignments = useMemo(() => {
    return (assignments || []).map((a: any) => {
      const aid = a.id ?? a.assignmentId;
      const found = reviewByAssignment.get(aid);
      const reviewSummary = found
        ? {
          id: found.id ?? (found as any).Id,
          status: toLower(found.status),
          assignmentId: found.assignmentId,
          submittedAt: found.createdAt ?? null,
        }
        : null;
      const rawStatus =
        a.status ??
        a.assignmentStatus ??
        a.statusName ??
        (a as any).assignment?.status ??
        null;

      const normalizedAssignmentStatus = toLower(rawStatus);
      return {
        ...a,
        review: reviewSummary,
        reviewStatus: reviewSummary?.status ?? null,
        reviewId: reviewSummary?.id ?? null,
        normalizedStatus: normalizedAssignmentStatus,
      } as ReviewerAssignmentResponseDTO & {
        review?: any;
        reviewStatus?: string | null;
        reviewId?: any;
        normalizedStatus?: string;
      };
    });
  }, [assignments, reviewByAssignment]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS.ALL);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const startReviewMut = useStartReview();
  const withdrawMut = useWithdrawReview();

  const handlers = useMemo(
    () => ({
      onViewSubmission: (submissionId: number | string) => {
        if (!submissionId) {
          toast.info("Không tìm thấy submission để xem chi tiết");
          return;
        }
        navigate(`/reviewers/assigned-topics/detail/${encodeURIComponent(String(submissionId))}`);
      },
    }),
    [navigate]
  );

  // onOpenReview: allow opening draft / start review / withdraw then open
  const onOpenReview = useCallback(
    async (row: ReviewerAssignmentResponseDTO, directReviewId?: number | string) => {
      const assignmentId = (row as any).id ?? (row as any).assignmentId;
      if (!assignmentId) {
        toast.error("Không có assignmentId hợp lệ");
        return;
      }

      try {
        console.debug("OPEN_REVIEW row:", row);
        if (directReviewId != null) {
          navigate(
            `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(
              String(directReviewId)
            )}`
          );
          return;
        }
        const found = reviewByAssignment.get(assignmentId);
        console.debug("reviewByAssignment found:", found);

        if (found) {
          const st = toLower(found.status ?? "");
          const rid = found.id ?? found.Id ?? (found as any).reviewId;

          // Draft -> open
          if (st === "draft") {
            navigate(
              `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(String(rid))}`
            );
            return;
          }

          // Submitted -> ask to withdraw then open a new review (or editing)
          if (st === "submitted") {
            const conf = window.confirm("Bản đánh giá này đã được gửi. Bạn muốn rút lại để chỉnh sửa?");
            if (!conf) return;

            withdrawMut.mutate(rid, {
              onSuccess: () => {
                toast.success("Yêu cầu rút đánh giá đã gửi. Bạn có thể chỉnh sửa sau khi hệ thống xử lý.");
                navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}`);
              },
              onError: (err: any) => {
                toast.error(err?.message || "Rút đánh giá thất bại");
              },
            });
            return;
          }
        }

        // fallback: get reviews by assignment to find draft/submitted
        let list: any[] = [];
        try {
          list = (await getReviewsByAssignment(assignmentId)) ?? [];
        } catch (err: any) {
          console.warn("getReviewsByAssignment failed", err);
          list = [];
        }

        if (Array.isArray(list) && list.length > 0) {
          const draft = list.find((r) => toLower(r.status || "") === "draft");
          if (draft) {
            const rid = draft.id ?? draft.Id;
            navigate(
              `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(String(rid))}`
            );
            return;
          }

          const submitted = list.find((r) => toLower(r.status || "") === "submitted");
          if (submitted) {
            const rid = submitted.id ?? submitted.Id;
            const conf2 = window.confirm("Bản đánh giá đã được gửi. Bạn muốn rút lại để chỉnh sửa?");
            if (!conf2) return;
            withdrawMut.mutate(rid, {
              onSuccess: () => {
                toast.success("Yêu cầu rút đánh giá đã gửi. Bạn có thể chỉnh sửa sau khi hệ thống xử lý.");
                navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}`);
              },
              onError: (err: any) => {
                toast.error(err?.message || "Rút đánh giá thất bại");
              },
            });
            return;
          }
        }

        // Decide whether starting a new review is allowed:
        const statusKey = toLower((row as any).status ?? (row as any).assignmentStatus ?? (row as any).statusName ?? "");
        const now = new Date();

        let allowStart = false;
        if (statusKey === "assigned" || statusKey === "") {
          allowStart = true;
        } else {
          // If there's a deadline/ due date and it's not overdue -> allow
          const maybeDeadline =
            (row as any).submissionDeadline ??
            (row as any).deadline ??
            (row as any).dueDate ??
            (row as any).submissionDueDate ??
            null;

          if (maybeDeadline) {
            const dd = new Date(maybeDeadline);
            if (!isNaN(dd.getTime()) && dd >= now) {
              allowStart = true;
            }
          }

          // fallback: if there is no review found and status not present, allow
          const foundReview = reviewByAssignment.get(assignmentId);
          if (!allowStart && !foundReview && (!statusKey || statusKey.length === 0)) {
            allowStart = true;
          }
        }

        if (allowStart) {
          if (startReviewMut.isPending) {
            toast.info("Đang bắt đầu phiên đánh giá — vui lòng chờ.");
            return;
          }
          startReviewMut.mutate(assignmentId, {
            onSuccess: () => {
              navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}`);
            },
            onError: (e: any) => {
              toast.error(e?.message || "Không thể bắt đầu phiên đánh giá");
            },
          });
        } else {
          toast.info("Không có bản nháp để chỉnh sửa; trạng thái hiện tại không cho phép bắt đầu đánh giá.");
        }
      } catch (e: any) {
        console.error("Error in onOpenReview", e);
        toast.error(e?.message || "Lỗi khi mở đánh giá");
      }
    },
    [navigate, reviewByAssignment, withdrawMut, startReviewMut]
  );

  const onWithdrawReview = useCallback(
    async (row: ReviewerAssignmentResponseDTO) => {
      const assignmentId = (row as any).id ?? (row as any).assignmentId;
      if (!assignmentId) {
        toast.error("Assignment ID không hợp lệ");
        return;
      }

      try {
        const found = reviewByAssignment.get(assignmentId);
        let rid = found ? (found.id ?? found.Id) : null;

        if (!rid) {
          const list = await getReviewsByAssignment(assignmentId);
          if (Array.isArray(list) && list.length > 0) {
            const pick = list.find((r) => toLower(r.status || "") === "submitted") ?? list[0];
            rid = pick?.id ?? null;
          }
        }

        if (!rid) {
          toast.info("Chưa tìm thấy review để rút lại.");
          return;
        }

        const ok = window.confirm("Bạn có chắc muốn rút lại đánh giá này?");
        if (!ok) return;

        withdrawMut.mutate(rid, {
          onSuccess: () => {
            toast.success("Yêu cầu rút đánh giá đã gửi.");
          },
          onError: (err: any) => {
            toast.error(err?.message || "Rút đánh giá thất bại");
          },
        });
      } catch (e: any) {
        console.error("onWithdrawReview error", e);
        toast.error(e?.message || "Lỗi khi rút đánh giá");
      }
    },
    [reviewByAssignment, withdrawMut]
  );

  const handlersObject = useMemo(
    () => ({
      onViewSubmission: handlers.onViewSubmission,
      onOpenReview,
      onWithdrawReview,
      canWithdrawFromStatus: (status: unknown) => {
        const k = canonicalAssignmentStatus(status);
        // allow withdraw if inprogress or completed (backend rules may differ)
        return k === "inprogress" || k === "completed";
      },
    }),
    [handlers, onOpenReview, onWithdrawReview]
  );

  const columns = useMemo(() => createColumns(handlersObject), [handlersObject]);

  const filtered: any[] = useMemo(() => {
    const q = debouncedSearch;
    const arr = enrichedAssignments;
    return arr.filter((x: any) => {
      const statusKey = canonicalAssignmentStatus(x.status ?? x.assignmentStatus ?? x.statusName ?? "");
      const okStatus = statusFilter === STATUS.ALL ? true : statusKey === statusFilter;
      if (!okStatus) return false;
      if (!q) return true;
      const haystack = `${x.id ?? ""} ${x.submissionId ?? ""} ${x.submissionTitle ?? ""} ${x.topicTitle ?? ""} ${x.reviewerName ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [enrichedAssignments, debouncedSearch, statusFilter]);

  if (isLoading || statsLoading) return <LoadingPage />;
  if (error) return <div className="p-6 text-red-600">Lỗi tải danh sách: {error.message}</div>;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px]">
          <label htmlFor="assignSearch" className="block text-sm mb-1">
            Tìm kiếm
          </label>
          <Input
            id="assignSearch"
            placeholder="Mã phân công / submission / tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm phân công"
          />
        </div>

        <div>
          <label htmlFor="statusFilter" className="block text-sm mb-1">
            Trạng thái
          </label>
          <select
            id="statusFilter"
            className="rounded border px-2 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc trạng thái"
          >
            <option value={STATUS.ALL}>Tất cả</option>
            <option value={STATUS.ASSIGNED}>Đã phân công</option>
            <option value={STATUS.INPROGRESS}>Đang đánh giá</option>
            <option value={STATUS.COMPLETED}>Hoàn thành</option>
            <option value={STATUS.OVERDUE}>Quá hạn</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns as any}
        visibility={DEFAULT_VISIBILITY as any}
        placeholder="Tìm theo đề tài, submission..."
        page={1}
        setPage={() => { }}
        totalPages={1}
        limit={filtered.length}
        setLimit={() => { }}
      />
    </div>
  );
}
