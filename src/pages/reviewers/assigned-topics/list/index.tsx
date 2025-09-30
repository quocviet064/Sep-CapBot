import React, { useMemo, useCallback, useState, useEffect } from "react";
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
  ASSIGNED: "Assigned",
  INPROGRESS: "InProgress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
} as const;

export default function ReviewerAssignedList() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useMyAssignments();
  const assignments = data ?? [];

  const { data: reviewStatsResp, isLoading: statsLoading } = useReviewStatistics();
  const reviewList = reviewStatsResp?.listObjects ?? [];

  const reviewByAssignment = useMemo(() => {
    const map = new Map<number | string, any>();
    if (!Array.isArray(reviewList)) return map;

    for (const rv of reviewList) {
      const aid = rv.assignmentId ?? rv.AssignmentId ?? rv.assignment?.id ?? null;
      if (aid == null) continue;

      const existing = map.get(aid);
      if (!existing) {
        map.set(aid, rv);
        continue;
      }

      const prefOrder = (s: string | undefined | null) =>
        s === "Submitted" ? 3 : s === "Draft" ? 2 : s === "InProgress" ? 1 : 0;

      const eScore = prefOrder(existing.status);
      const rScore = prefOrder(rv.status);

      if (rScore > eScore) {
        map.set(aid, rv);
      } else if (rScore === eScore) {
        const eTime = new Date(existing.submittedAt ?? existing.createdDate ?? existing.createdAt ?? 0).getTime();
        const rTime = new Date(rv.submittedAt ?? rv.createdDate ?? rv.createdAt ?? 0).getTime();
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
            id: found.id ?? found.Id,
            status: found.status,
            assignmentId: found.assignmentId,
            submittedAt: found.submittedAt ?? found.createdDate ?? found.createdAt,
          }
        : null;
      return {
        ...a,
        review: reviewSummary,
        reviewStatus: reviewSummary?.status ?? null,
        reviewId: reviewSummary?.id ?? null,
      } as ReviewerAssignmentResponseDTO & { review?: any; reviewStatus?: string | null; reviewId?: any };
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
      const assignmentId = row.id ?? row.assignmentId;
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
          const st = String(found.status ?? "").toLowerCase();
          const rid = found.id ?? found.Id ?? found.reviewId;

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

          // Other statuses: fall through to further checks
        }

        let list: any[] = [];
        try {
          list = (await getReviewsByAssignment(assignmentId)) ?? [];
        } catch (err: any) {
          console.warn("getReviewsByAssignment failed", err);
          list = [];
        }

        if (Array.isArray(list) && list.length > 0) {
          const draft = list.find((r) => String(r.status || "").toLowerCase() === "draft");
          if (draft) {
            const rid = draft.id ?? draft.Id;
            navigate(
              `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(String(rid))}`
            );
            return;
          }

          const submitted = list.find((r) => String(r.status || "").toLowerCase() === "submitted");
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
        const statusKey = String(row.status ?? "").trim();
        const now = new Date();

        const isStatusEquals = (val?: unknown, expect?: string) =>
          String(val ?? "").toLowerCase() === String(expect ?? "").toLowerCase();

        let allowStart = false;
        if (isStatusEquals(statusKey, STATUS.ASSIGNED)) {
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

          if (!allowStart && !found && (!statusKey || statusKey.length === 0)) {
            allowStart = true;
          }
        }

        if (allowStart) {
          if (startReviewMut.isLoading) {
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
      const assignmentId = row.id ?? row.assignmentId;
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
            const pick = list.find((r) => r.status === "Submitted") ?? list[0];
            rid = pick?.id ?? pick?.Id ?? null;
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
        const k = String(status || "");
        return k === STATUS.INPROGRESS || k === STATUS.COMPLETED;
      },
    }),
    [handlers, onOpenReview, onWithdrawReview]
  );

  const columns = useMemo(() => createColumns(handlersObject), [handlersObject]);

  const filtered: any[] = useMemo(() => {
    const q = debouncedSearch;
    const arr = enrichedAssignments;
    return arr.filter((x: any) => {
      const statusKey = String(x.status ?? "");
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
      />
    </div>
  );
}
