// src/pages/reviewers/assigned-topics/list/index.tsx
import React, { useMemo } from "react";
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

  // load review statistics (global) via hook
  const { data: reviewStatsResp, isLoading: statsLoading } = useReviewStatistics();
  const reviewList = reviewStatsResp?.listObjects ?? [];

  // build map assignmentId -> chosen review (prefer Submitted > Draft > newest)
  const reviewByAssignment = useMemo(() => {
    const map = new Map<number | string, any>();
    for (const rv of reviewList) {
      const aid = rv.assignmentId ?? (rv as any).AssignmentId;
      if (aid == null) continue;
      const existing = map.get(aid);
      if (!existing) {
        map.set(aid, rv);
        continue;
      }
      const prefOrder = (s: string | undefined | null) => (s === "Submitted" ? 2 : s === "Draft" ? 1 : 0);
      const eScore = prefOrder(existing.status);
      const rScore = prefOrder(rv.status);
      if (rScore > eScore) {
        map.set(aid, rv);
      } else if (rScore === eScore) {
        const eTime = new Date(existing.submittedAt ?? existing.createdDate ?? 0).getTime();
        const rTime = new Date(rv.submittedAt ?? rv.createdDate ?? 0).getTime();
        if (rTime > eTime) map.set(aid, rv);
      }
    }
    return map;
  }, [reviewList]);

  // Enrich assignments with review summary so columns can read it
  const enrichedAssignments = useMemo(() => {
    return (assignments || []).map((a: any) => {
      const aid = a.id ?? a.assignmentId;
      const found = reviewByAssignment.get(aid);
      const reviewSummary = found
        ? {
          id: found.id ?? found.Id,
          status: found.status,
          assignmentId: found.assignmentId,
          submittedAt: found.submittedAt,
          createdDate: found.createdDate,
        }
        : null;
      return {
        ...a,
        review: reviewSummary,
        reviewStatus: reviewSummary?.status ?? null,
        reviewId: reviewSummary?.id ?? null,
      };
    });
  }, [assignments, reviewByAssignment]);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>(STATUS.ALL);

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

      onOpenReview: async (row: ReviewerAssignmentResponseDTO, directReviewId?: number | string) => {
        const assignmentId = row.id ?? row.assignmentId;
        if (!assignmentId) {
          toast.error("Không có assignmentId hợp lệ");
          return;
        }

        try {
          if (directReviewId != null) {
            navigate(
              `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(
                String(directReviewId)
              )}`
            );
            return;
          }

          const found = reviewByAssignment.get(assignmentId);

          if (found) {
            if (found.status === "Draft") {
              const rid = found.id ?? found.Id;
              navigate(
                `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(String(rid))}`
              );
              return;
            }

            if (found.status === "Submitted") {
              const rid = found.id ?? found.Id;
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

          const list = await getReviewsByAssignment(assignmentId);
          if (Array.isArray(list) && list.length > 0) {
            const draft = list.find((r) => r.status === "Draft");
            if (draft) {
              const rid = draft.id ?? draft.Id;
              navigate(
                `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}&reviewId=${encodeURIComponent(String(rid))}`
              );
              return;
            }
            const submitted = list.find((r) => r.status === "Submitted");
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

          const statusKey = String(row.status || "");
          if (statusKey === STATUS.ASSIGNED) {
            startReviewMut.mutate(assignmentId, {
              onSuccess: () => {
                navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(assignmentId))}`);
              },
              onError: (e: any) => {
                toast.error(e?.message || "Không thể bắt đầu phiên đánh giá");
              },
            });
          } else {
            toast.info("Không có bản nháp để chỉnh sửa; trạng thái hiện tại không cho phép mở đánh giá.");
          }
        } catch (e: any) {
          toast.error(e?.message || "Lỗi khi mở đánh giá");
        }
      },

      onWithdrawReview: async (row: ReviewerAssignmentResponseDTO) => {
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
          toast.error(e?.message || "Lỗi khi rút đánh giá");
        }
      },

      canWithdrawFromStatus: (status: unknown) => {
        const k = String(status || "");
        return k === STATUS.INPROGRESS || k === STATUS.COMPLETED;
      },
    }),
    [navigate, startReviewMut, withdrawMut, reviewByAssignment]
  );

  const columns = useMemo(() => createColumns(handlers), [handlers]);

  const filtered: any[] = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    const arr = enrichedAssignments;
    return arr.filter((x: any) => {
      const statusKey = String(x.status || "");
      const okStatus = statusFilter === STATUS.ALL ? true : statusKey === statusFilter;
      if (!okStatus) return false;
      if (!q) return true;
      const haystack = `${x.id} ${x.submissionId} ${x.submissionTitle ?? ""} ${x.topicTitle ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [enrichedAssignments, search, statusFilter]);

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
        /* remove the search prop here — we already have the top search box */
        placeholder="Tìm theo đề tài, submission..."
      />
    </div>
  );
}
