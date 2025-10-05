import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import LoadingPage from "@/pages/loading-page";
import {
  useMyAssignments,
  useStartReview,
} from "@/hooks/useReviewerAssignment";
import {
  getReviewsByAssignment,
  type ReviewDTO,
} from "@/services/reviewService";
import type {
  ReviewerAssignmentResponseDTO,
  AssignmentStatus,
} from "@/services/reviewerAssignmentService";

type ID = number | string;

type AssignmentItem = {
  id: ID;
  assignedAt?: string | null;
  topicTitle?: string | null;
  submissionTitle?: string | null;
  submissionId?: ID | null;
  status?: AssignmentStatus | string | null;
};

function toNumberId(id: ID | null | undefined): number | null {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string" && /^\d+$/.test(id)) return Number(id);
  return null;
}

function safeDateMs(s?: string | null): number {
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function statusKey(s: AssignmentStatus | string | null | undefined): string {
  if (s == null) return "";
  if (typeof s === "number") {
    switch (s) {
      case 1:
        return "assigned";
      case 2:
        return "inprogress";
      case 3:
        return "completed";
      case 4:
        return "overdue";
      default:
        return String(s).toLowerCase();
    }
  }
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export default function ReviewerDashboard() {
  const navigate = useNavigate();

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useMyAssignments();

  const assignments: AssignmentItem[] = useMemo(() => {
    const arr = (assignmentsData ?? []) as ReviewerAssignmentResponseDTO[];
    return arr.map((a) => ({
      id: a.id,
      assignedAt: a.assignedAt ?? null,
      topicTitle: a.topicTitle ?? a.submissionTitle ?? null,
      submissionTitle: a.submissionTitle ?? null,
      submissionId: a.submissionId ?? null,
      status: a.status,
    }));
  }, [assignmentsData]);

  const startReviewMut = useStartReview();

  const RECENT_COUNT = 5;

  const recentAssignments: AssignmentItem[] = useMemo(
    () =>
      [...assignments]
        .sort((a, b) => safeDateMs(b.assignedAt) - safeDateMs(a.assignedAt))
        .slice(0, RECENT_COUNT),
    [assignments],
  );

  const [recentReviews, setRecentReviews] = useState<
    Array<ReviewDTO & { assignmentId?: ID }>
  >([]);
  const [loadingRecentReviews, setLoadingRecentReviews] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!recentAssignments.length) {
        setRecentReviews([]);
        return;
      }
      setLoadingRecentReviews(true);
      try {
        const promises = recentAssignments.map(async (a) => {
          const idNum = toNumberId(a.id);
          if (idNum == null) return [] as ReviewDTO[];
          try {
            return await getReviewsByAssignment(idNum);
          } catch {
            return [] as ReviewDTO[];
          }
        });

        const results = await Promise.all(promises);
        if (!mounted) return;

        const flattened: Array<ReviewDTO & { assignmentId?: ID }> = results
          .map((list, idx) => {
            if (!Array.isArray(list) || list.length === 0) return null;
            const submitted = list.find((r) => r.status === "Submitted");
            const pick =
              submitted ??
              [...list].sort((x, y) => {
                const tx = safeDateMs(x.updatedAt ?? x.createdAt);
                const ty = safeDateMs(y.updatedAt ?? y.createdAt);
                return ty - tx;
              })[0];
            if (!pick) return null;
            return { ...pick, assignmentId: recentAssignments[idx].id };
          })
          .filter((v): v is ReviewDTO & { assignmentId?: ID } => Boolean(v));

        setRecentReviews(flattened);
      } finally {
        if (mounted) setLoadingRecentReviews(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [recentAssignments]);

  const isLoading = assignmentsLoading || loadingRecentReviews;

  const summary = useMemo(() => {
    const s = {
      assigned: 0,
      inprogress: 0,
      completed: 0,
      drafts: 0,
      submittedReviews: 0,
    };
    for (const a of assignments) {
      const st = statusKey(a.status);
      if (st === "assigned") s.assigned++;
      else if (st === "inprogress") s.inprogress++;
      else if (st === "completed") s.completed++;
    }
    for (const r of recentReviews) {
      const st = String(r.status ?? "").toLowerCase();
      if (st === "draft") s.drafts++;
      if (st === "submitted") s.submittedReviews++;
    }
    return s;
  }, [assignments, recentReviews]);

  if (isLoading) return <LoadingPage />;

  if (assignmentsError) {
    const msg =
      assignmentsError instanceof Error
        ? assignmentsError.message
        : String(assignmentsError);
    return <div className="p-6 text-red-600">Lỗi tải assignment: {msg}</div>;
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reviewer Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Tóm tắt nhanh các phân công và review của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card
          title="Đã phân công"
          value={summary.assigned}
          note="Chưa bắt đầu"
        />
        <Card
          title="Đang đánh giá"
          value={summary.inprogress}
          note="Đang tiến hành"
        />
        <Card
          title="Hoàn thành"
          value={summary.completed}
          note="Đã hoàn thành"
        />
        <Card
          title="Bản nháp (recent)"
          value={summary.drafts}
          note={`Trong ${RECENT_COUNT} phân công gần nhất`}
        />
        <Card
          title="Đã gửi (recent)"
          value={summary.submittedReviews}
          note={`Trong ${RECENT_COUNT} phân công gần nhất`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Phân công gần đây</h2>
              <div className="text-muted-foreground text-sm">
                Top {recentAssignments.length} phân công gần nhất
              </div>
            </div>
            <div className="text-sm">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate("/reviewers/assigned-topics")}
              >
                Xem tất cả
              </Button>
            </div>
          </div>

          {recentAssignments.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              Không có phân công
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((a) => {
                const topicTitle =
                  a.topicTitle ?? a.submissionTitle ?? "Không có tiêu đề";
                const assignedAt = a.assignedAt
                  ? new Date(a.assignedAt).toLocaleString()
                  : "--";
                const reviewForAssignment = recentReviews.find(
                  (rv) => String(rv.assignmentId ?? "") === String(a.id),
                );
                const reviewStatus = reviewForAssignment?.status ?? null;

                return (
                  <div
                    key={String(a.id)}
                    className="flex items-center justify-between gap-3 rounded border p-3"
                  >
                    <div>
                      <div className="font-medium">
                        #{String(a.id)} — {topicTitle}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Submission: {String(a.submissionId ?? "--")} • Assigned:{" "}
                        {assignedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {reviewStatus ? (
                        <div
                          className={`rounded-full border px-2 py-1 text-xs ${
                            reviewStatus === "Draft"
                              ? "bg-yellow-50 text-yellow-800"
                              : "bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {reviewStatus}
                        </div>
                      ) : null}

                      <Button
                        size="sm"
                        onClick={() => {
                          if (
                            reviewForAssignment &&
                            reviewForAssignment.status === "Draft"
                          ) {
                            navigate(
                              `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(
                                String(a.id),
                              )}&reviewId=${encodeURIComponent(String(reviewForAssignment.id))}`,
                            );
                            return;
                          }
                          const st = statusKey(a.status);
                          if (st === "assigned") {
                            const idNum = toNumberId(a.id);
                            if (idNum == null) {
                              alert("ID phân công không hợp lệ");
                              return;
                            }
                            startReviewMut.mutate(idNum, {
                              onSuccess: () =>
                                navigate(
                                  `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(a.id))}`,
                                ),
                              onError: (e: unknown) => {
                                const msg =
                                  e instanceof Error
                                    ? e.message
                                    : "Không thể bắt đầu phiên đánh giá";
                                alert(msg);
                              },
                            });
                          } else {
                            navigate(
                              `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(a.id))}`,
                            );
                          }
                        }}
                      >
                        Đánh giá
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Đánh giá gần đây</h2>
              <div className="text-muted-foreground text-sm">
                Các review liên quan tới phân công gần đây
              </div>
            </div>
            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate("/reviewers/reviews")}
              >
                Quản lý reviews
              </Button>
            </div>
          </div>

          {recentReviews.length === 0 ? (
            <div className="text-muted-foreground p-6 text-center text-sm">
              Không có review gần đây
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((r) => (
                <div
                  key={String(r.id)}
                  className="flex items-center justify-between gap-3 rounded border p-3"
                >
                  <div>
                    <div className="font-medium">
                      Review #{String(r.id)} — Assignment #
                      {String(r.assignmentId ?? "--")}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {r.overallComment ?? "Không có nhận xét"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Điểm: {r.overallScore ?? "--"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-full border px-2 py-1 text-xs ${
                        r.status === "Draft"
                          ? "bg-yellow-50 text-yellow-800"
                          : r.status === "Submitted"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {r.status ?? "--"}
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(
                            String(r.assignmentId ?? ""),
                          )}&reviewId=${encodeURIComponent(String(r.id))}`,
                        )
                      }
                    >
                      Mở
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  note,
}: {
  title: string;
  value: number | string;
  note?: string;
}) {
  return (
    <div className="min-w-[160px] flex-1 rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-muted-foreground text-sm">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {note ? (
        <div className="text-muted-foreground mt-2 text-xs">{note}</div>
      ) : null}
    </div>
  );
}
