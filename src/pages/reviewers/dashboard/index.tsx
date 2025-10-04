import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/globals/atoms/button";
import LoadingPage from "@/pages/loading-page";
import { useMyAssignments, useStartReview } from "@/hooks/useReviewerAssignment";
import { useWithdrawReview } from "@/hooks/useReview";
import { getReviewsByAssignment, type ReviewDTO } from "@/services/reviewService";

export default function ReviewerDashboard() {
  const navigate = useNavigate();

  const { data: assignmentsData, isLoading: assignmentsLoading, error: assignmentsError } = useMyAssignments();
  const assignments = assignmentsData ?? [];

  const startReviewMut = useStartReview();
  const withdrawMut = useWithdrawReview();

  const RECENT_COUNT = 5;
  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort((a: any, b: any) => {
        const ta = a?.assignedAt ? new Date(a.assignedAt).getTime() : 0;
        const tb = b?.assignedAt ? new Date(b.assignedAt).getTime() : 0;
        return tb - ta;
      })
      .slice(0, RECENT_COUNT);
  }, [assignments]);

  const [recentReviews, setRecentReviews] = useState<Array<ReviewDTO & { assignmentId?: number }>>([]);
  const [loadingRecentReviews, setLoadingRecentReviews] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!recentAssignments || recentAssignments.length === 0) {
        setRecentReviews([]);
        return;
      }
      setLoadingRecentReviews(true);
      try {
        const promises = recentAssignments.map((a: any) =>
          getReviewsByAssignment(a.id).catch(() => [] as ReviewDTO[])
        );
        const results = await Promise.all(promises);
        if (!mounted) return;

        const flattened: Array<ReviewDTO & { assignmentId?: number }> = results.map((list, idx) => {
          if (!Array.isArray(list) || list.length === 0) return null;
          const submitted = list.find((r) => r.status === "Submitted");
          const pick = submitted ?? list.sort((x, y) => {
            const tx = new Date(x.updatedAt ?? x.createdAt ?? 0).getTime();
            const ty = new Date(y.updatedAt ?? y.createdAt ?? 0).getTime();
            return ty - tx;
          })[0];
          if (!pick) return null;
          return { ...pick, assignmentId: recentAssignments[idx].id };
        }).filter(Boolean) as Array<ReviewDTO & { assignmentId?: number }>;

        setRecentReviews(flattened);
      } catch (e) {
        setRecentReviews([]);
      } finally {
        if (mounted) setLoadingRecentReviews(false);
      }
    }
    load();
    return () => { mounted = false; };
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
      const st = String(a.status ?? "").toLowerCase();
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
  if (assignmentsError) return <div className="p-6 text-red-600">Lỗi tải assignment: {String(assignmentsError?.message ?? assignmentsError)}</div>;

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reviewer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tóm tắt nhanh các phân công và review của bạn</p>
        </div>

        <div className="flex gap-2 items-center">
          <Button size="sm" variant="secondary" onClick={() => navigate("/reviewers/assigned-topics")}>Danh sách phân công</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate("/reviewers/evaluate-topics")}>Bắt đầu đánh giá</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card title="Đã phân công" value={summary.assigned} note="Chưa bắt đầu" />
        <Card title="Đang đánh giá" value={summary.inprogress} note="Đang tiến hành" />
        <Card title="Hoàn thành" value={summary.completed} note="Đã hoàn thành" />
        <Card title="Bản nháp (recent)" value={summary.drafts} note={`Trong ${RECENT_COUNT} phân công gần nhất`} />
        <Card title="Đã gửi (recent)" value={summary.submittedReviews} note={`Trong ${RECENT_COUNT} phân công gần nhất`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent assignments */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium">Phân công gần đây</h2>
              <div className="text-sm text-muted-foreground">Top {recentAssignments.length} phân công gần nhất</div>
            </div>
            <div className="text-sm">
              <Button size="sm" variant="secondary" onClick={() => navigate("/reviewers/assigned-topics")}>Xem tất cả</Button>
            </div>
          </div>

          {recentAssignments.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Không có phân công</div>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((a: any) => {
                const topicTitle = a.topicTitle ?? a.submissionTitle ?? "Không có tiêu đề";
                const assignedAt = a.assignedAt ? new Date(a.assignedAt).toLocaleString() : "--";
                const reviewForAssignment = recentReviews.find((rv) => Number(rv.assignmentId) === Number(a.id));
                const reviewStatus = reviewForAssignment?.status ?? null;

                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 border p-3 rounded">
                    <div>
                      <div className="font-medium">#{a.id} — {topicTitle}</div>
                      <div className="text-xs text-muted-foreground">Submission: {String(a.submissionId ?? "--")} • Assigned: {assignedAt}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {reviewStatus ? (
                        <div className={`text-xs px-2 py-1 rounded-full border ${reviewStatus === "Draft" ? "bg-yellow-50 text-yellow-800" : "bg-emerald-50 text-emerald-800"}`}>
                          {reviewStatus}
                        </div>
                      ) : null}

                      <Button size="sm" onClick={() => {
                        if (reviewForAssignment && reviewForAssignment.status === "Draft") {
                          navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(a.id))}&reviewId=${encodeURIComponent(String(reviewForAssignment.id))}`);
                        } else if (String(a.status ?? "").toLowerCase() === "assigned") {
                          startReviewMut.mutate(a.id, {
                            onSuccess: () => navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(a.id))}`),
                            onError: (e: any) => alert(e?.message || "Không thể bắt đầu phiên đánh giá"),
                          });
                        } else {
                          navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(a.id))}`);
                        }
                      }}>Đánh giá</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent reviews (picked from per-assignment calls) */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium">Đánh giá gần đây</h2>
              <div className="text-sm text-muted-foreground">Các review liên quan tới phân công gần đây</div>
            </div>
            <div>
              <Button size="sm" variant="secondary" onClick={() => navigate("/reviewers/reviews")}>Quản lý reviews</Button>
            </div>
          </div>

          {recentReviews.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Không có review gần đây</div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-3 border p-3 rounded">
                  <div>
                    <div className="font-medium">Review #{r.id} — Assignment #{r.assignmentId}</div>
                    <div className="text-xs text-muted-foreground">{r.overallComment ?? "Không có nhận xét"}</div>
                    <div className="text-xs text-muted-foreground">Điểm: {r.overallScore ?? "--"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-1 rounded-full border ${r.status === "Draft" ? "bg-yellow-50 text-yellow-800" : r.status === "Submitted" ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"}`}>
                      {r.status ?? "--"}
                    </div>

                    <Button size="sm" onClick={() => navigate(`/reviewers/evaluate-topics/review?assignmentId=${encodeURIComponent(String(r.assignmentId))}&reviewId=${encodeURIComponent(String(r.id))}`)}>Mở</Button>

                    {r.status === "Submitted" ? (
                      <Button size="sm" variant="destructive" onClick={() => {
                        const ok = window.confirm("Bạn có chắc muốn rút lại đánh giá này?");
                        if (!ok) return;
                        withdrawMut.mutate(r.id, {
                          onSuccess: () => alert("Yêu cầu rút đánh giá đã gửi."),
                          onError: (e: any) => alert(e?.message || "Rút thất bại"),
                        });
                      }}>Rút</Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* quick actions */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-medium mb-2">Hành động nhanh</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate("/reviewers/assigned-topics")}>Danh sách phân công</Button>
          <Button size="sm" onClick={() => navigate("/reviewers/evaluate-topics")}>Bắt đầu đánh giá</Button>
          <Button size="sm" variant="secondary" onClick={() => navigate("/reviewers/reviews")}>Quản lý reviews</Button>
        </div>
      </div>
    </div>
  );
}

/* Small Card component */
function Card({ title, value, note }: { title: string; value: number | string; note?: string }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm flex-1 min-w-[160px]">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {note ? <div className="text-xs text-muted-foreground mt-2">{note}</div> : null}
    </div>
  );
}
