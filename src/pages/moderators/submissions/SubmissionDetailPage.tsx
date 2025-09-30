/* SubmissionDetailPage.tsx (partial/full file) */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSubmissionDetail } from "@/hooks/useSubmission";
import { useTopicDetail } from "@/hooks/useTopic";
import { useSubmissionReviewSummary } from "@/hooks/useSubmissionReview";

import type { SubmissionListItem } from "@/services/submissionService";
import type { TopicDetailResponse, SubmissionDTO } from "@/services/topicService";
import type { SubmissionReviewSummaryDTO } from "@/services/submissionReviewService";

import {
  useBulkAssignReviewers,
  useAvailableReviewers,
  useAssignmentsBySubmission,
  useCancelAssignment,
} from "@/hooks/useReviewerAssignment";

import ReviewerPickerDialog from "./ReviewerPickerDialog";
import ReviewerSuggestionDialog from "./ReviewerSuggestionDialog";
import AICheckSection from "./components/AICheckSection";
import ReviewsModal from "./components/ReviewsModal";
import SidebarActions from "./components/SidebarActions";
import FinalReviewDialog from "./components/FinalReviewDialog";

/* --- helper: map status to css classes (tailwind-like) --- */
function statusColorClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-700";
  const s = status.toLowerCase();
  if (s.includes("under") || s.includes("pending")) return "bg-yellow-100 text-yellow-800";
  if (s.includes("approved")) return "bg-green-100 text-green-800";
  if (s.includes("rejected")) return "bg-red-100 text-red-800";
  if (s.includes("duplicate")) return "bg-purple-100 text-purple-800";
  if (s.includes("revision") || s.includes("revisionrequired")) return "bg-orange-100 text-orange-800";
  if (s.includes("escalated")) return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

type RouteState = {
  topicId?: number;
  row?: SubmissionListItem;
  topicDetail?: TopicDetailResponse;
} | undefined;

export default function SubmissionDetailPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { state } = useLocation();

  const typedState = state as RouteState;
  const initialRow = (typedState?.row as SubmissionListItem | undefined) ?? undefined;
  const sid: number | undefined = submissionId ? Number(submissionId) : undefined;

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const { data: submissionDetailShort } = useSubmissionDetail(sid);
  const topicIdFromState = typedState?.topicId ?? (submissionDetailShort as any)?.topicId ?? undefined;
  const topicId: number | undefined = topicIdFromState ? Number(topicIdFromState) : undefined;

  const { data: topicDetailResponse, refetch: refetchTopicDetail } = useTopicDetail(topicId);
  const topicDetail = topicDetailResponse as TopicDetailResponse | undefined;

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useSubmissionReviewSummary(sid);

  const selectedSubmission = useMemo<SubmissionDTO | undefined>(() => {
    if (!topicDetail) return (initialRow ?? (submissionDetailShort as any)) as SubmissionDTO | undefined;
    const subs = topicDetail.submissions ?? [];
    if (sid) {
      const found = subs.find((s) => s.id === sid);
      if (found) return found;
    }
    const sorted = subs.slice().sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    });
    return sorted[0] ?? ((initialRow ?? (submissionDetailShort as any)) as SubmissionDTO | undefined);
  }, [topicDetail, sid, initialRow, submissionDetailShort]);

  useEffect(() => {
    const id = selectedSubmission?.id;
    if (!id) return;
    const existing = qc.getQueryData(["submission-detail", id]);
    if (!existing) {
      qc.setQueryData(["submission-detail", id], selectedSubmission);
    }
  }, [qc, selectedSubmission]);

  const { data: assignments, isLoading: loadingAssignments } = useAssignmentsBySubmission(sid);
  const { data: availableReviewers, isLoading: loadingAvailable } = useAvailableReviewers(isPickerOpen ? sid : undefined);
  const bulkAssign = useBulkAssignReviewers();
  const cancelAssignment = useCancelAssignment();

  // derived states
  const requiredReviewers = topicDetail?.requiredReviewers ?? 2;
  const assignedCount = (assignments ?? []).length;
  const isAssignDisabled = assignedCount >= requiredReviewers;

  const recCount = (summary as any)?.recommendationsCount ?? (summary as any)?.recommendationCounts;
  const isEscalated = (() => {
    const status = (selectedSubmission as any)?.status ?? topicDetail?.latestSubmissionStatus ?? "";
    if (String(status).toLowerCase().includes("escalat")) return true;
    if (recCount) {
      const ok = Number(recCount.approve ?? recCount.Approve ?? 0);
      const rej = Number(recCount.reject ?? recCount.Reject ?? 0);
      if (ok > 0 && rej > 0) return true;
    }
    return false;
  })();

  // handlers
  const openReviews = async () => {
    setShowReviewsModal(true);
    try {
      await refetchSummary?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Không thể tải review summary");
    }
  };
  const closeReviews = () => setShowReviewsModal(false);
  const openPicker = () => (sid ? setIsPickerOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closePicker = () => setIsPickerOpen(false);
  const openAssignments = () => (sid ? setIsAssignmentsOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closeAssignments = () => setIsAssignmentsOpen(false);
  const openSuggestions = () => (sid ? setIsSuggestionOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closeSuggestions = () => setIsSuggestionOpen(false);
  const openFinalReview = () => (sid ? setIsFinalReviewOpen(true) : toast.error("Submission ID không hợp lệ"));
  const closeFinalReview = () => setIsFinalReviewOpen(false);

  /**
   * handleConfirmAssign now accepts different shapes:
   * - array of ids: [1,2]  (legacy)
   * - object with { assignments: [{ submissionId, reviewerId, assignmentType?, deadline? }, ...] }
   * - object with { reviewerIds: [...], assignmentType?, deadline? } (less preferred)
   *
   * We normalize to payload { assignments: [...] } and call bulkAssign.mutateAsync(payload)
   */
  const handleConfirmAssign = async (arg: any) => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    if (isAssignDisabled) {
      toast.error(`Đã có ${assignedCount} reviewer. Không thể phân công thêm.`);
      return;
    }

    // normalize
    let payload: any = null;

    // case 1: parent called with assignments payload already
    if (arg && Array.isArray(arg.assignments)) {
      payload = { assignments: arg.assignments.map((a: any) => ({ ...a, submissionId: a.submissionId ?? sid })) };
    } else if (Array.isArray(arg)) {
      // legacy: array of ids
      const reviewerIds = arg.map((id: any) => Number(id)).filter((n) => !Number.isNaN(n));
      if (reviewerIds.length === 0) {
        toast.error("Vui lòng chọn reviewer hợp lệ");
        return;
      }
      // default: no deadline, default assignmentType = 1
      payload = {
        assignments: reviewerIds.map((rid) => ({ submissionId: sid, reviewerId: rid, assignmentType: 1 })),
      };
    } else if (arg && Array.isArray(arg.reviewerIds)) {
      // maybe object with reviewerIds + assignmentType/deadline
      const reviewerIds = (arg.reviewerIds as any[]).map((id) => Number(id)).filter((n) => !Number.isNaN(n));
      if (reviewerIds.length === 0) {
        toast.error("Vui lòng chọn reviewer hợp lệ");
        return;
      }
      const at = arg.assignmentType ?? 1;
      const dl = arg.deadline ?? undefined;
      payload = {
        assignments: reviewerIds.map((rid) => ({ submissionId: sid, reviewerId: rid, assignmentType: at, deadline: dl })),
      };
    } else {
      toast.error("Dữ liệu phân công không hợp lệ");
      return;
    }

    // Extra validation: ensure each assignment has deadline (if your BE requires it)
    const missingDeadline = payload.assignments.some((a: any) => !a.deadline);
    if (missingDeadline) {
      // if you want to force deadline, uncomment next lines; currently we'll warn but still try
      // toast.error("Vui lòng cung cấp deadline cho mỗi phân công.");
      // return;
      // Instead show warning to user
      console.warn("Some assignments missing deadline:", payload);
    }

    setAssigning(true);
    try {
      const res = await bulkAssign.mutateAsync(payload as any);
      // backend may return { success: false, message } even with 200
      if (res && typeof res === "object" && (res.success === false || res.error)) {
        toast.error(res.message ?? res.error ?? "Phân công reviewer thất bại");
      } else {
        toast.success("Phân công reviewer thành công");
        if (topicId) qc.invalidateQueries({ queryKey: ["topicDetail", topicId] });
        qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
        qc.invalidateQueries({ queryKey: ["assignments", sid] });
        qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Phân công reviewer thất bại");
    } finally {
      setAssigning(false);
      closePicker();
    }
  };

  const handleRemoveAssignment = (assignmentId?: number | string) => {
    if (!assignmentId) {
      toast.error("Assignment ID không hợp lệ");
      return;
    }
    const ok = window.confirm("Bạn có chắc muốn huỷ phân công reviewer này không?");
    if (!ok) return;
    cancelAssignment.mutate(assignmentId, {
      onSuccess: () => {
        toast.success("Đã huỷ phân công reviewer");
        if (sid) {
          qc.invalidateQueries({ queryKey: ["assignments", sid] });
          qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
          qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
        }
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message ?? err?.message ?? "Không thể huỷ phân công");
      },
    });
  };

  const refreshTopicDetail = async () => {
    try {
      if (topicId) await refetchTopicDetail?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Không thể tải lại thông tin đề tài");
    }
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Left */}
            <div className="md:col-span-2 space-y-4 min-w-0">
              {/* Topic info card (enhanced) */}
              <div className="bg-white border rounded-md p-4 w-full">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Topic</div>
                    <div className="text-xl font-bold mt-1 truncate">{topicDetail?.eN_Title ?? topicDetail?.vN_title ?? "—"}</div>
                    <div className="text-sm text-slate-600 mt-2 line-clamp-3">{topicDetail?.description ?? "—"}</div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {(topicDetail?.tags ?? []).slice(0, 6).map((t: string, i: number) => (
                        <span key={i} className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-[#ecfeff] text-[#0ea5a0] border" >
                          {t}
                        </span>
                      ))}
                      {Array.isArray(topicDetail?.tags) && topicDetail.tags.length > 6 && (
                        <span className="text-xs text-slate-500">+{topicDetail.tags.length - 6} more</span>
                      )}
                    </div>

                    {(topicDetail?.keywords || topicDetail?.keywordsList) && (
                      <div className="mt-3 text-xs text-slate-500">
                        <strong>Keywords:</strong>{" "}
                        {(topicDetail.keywords ?? (topicDetail.keywordsList?.join?.(", ") ?? ""))}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-right min-w-[180px]">
                    <div className="mb-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass(topicDetail?.latestSubmissionStatus ?? "")}`}>
                        {topicDetail?.latestSubmissionStatus ?? "—"}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">Max students</div>
                    <div className="font-medium mb-2">{topicDetail?.maxStudents ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <div className="text-xs text-slate-500">Category</div>
                    <div className="font-medium">{topicDetail?.categoryName ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Semester</div>
                    <div className="font-medium">{topicDetail?.semesterName ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Supervisor</div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-sm">
                        {(topicDetail?.supervisorName ?? "U").split(" ").map((p: string) => p[0]?.toUpperCase()).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{topicDetail?.supervisorName ?? "—"}</div>
                        <div className="text-xs text-slate-500">{topicDetail?.supervisorEmail ?? ""}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Document</div>
                    <div className="font-medium">
                      {topicDetail?.documentUrl ? (
                        <a href={topicDetail.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                          Download document
                        </a>
                      ) : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <AICheckSection submissionDetail={selectedSubmission} />
            </div>

            {/* Right */}
            <aside className="space-y-4 min-w-0">
              <SidebarActions
                assignments={assignments}
                loadingAssignments={loadingAssignments}
                showReviews={!!showReviewsModal}
                toggleShowReviews={() => (!showReviewsModal ? openReviews() : closeReviews())}
                onOpenPicker={openPicker}
                onOpenSuggestions={openSuggestions}
                onOpenAssignments={openAssignments}
                onOpenFinalReview={openFinalReview}
                submissionId={sid}
                onRefreshTopicDetail={refreshTopicDetail}
                onRemoveAssignment={handleRemoveAssignment}
                reviewSummary={summary}
                isAssignDisabled={isAssignDisabled}
                isEscalated={isEscalated}
              />
            </aside>
          </div>
        </div>
      </div>

      {/* dialogs */}
      {isPickerOpen && sid && (
        <ReviewerPickerDialog
          isOpen={isPickerOpen}
          submissionId={sid}
          availableReviewers={availableReviewers ?? []}
          onClose={closePicker}
          // now parent expects full assignments payload (dialog will send)
          onConfirm={(payloadOrIds: any) => handleConfirmAssign(payloadOrIds)}
          // loading/disabled passed so dialog can disable appropriately
          loading={bulkAssign.isLoading || loadingAvailable || assigning}
          confirmDisabled={isAssignDisabled || assigning}
          assignedCount={assignedCount}
          requiredReviewers={requiredReviewers}
        />
      )}

      {isSuggestionOpen && sid && (
        <ReviewerSuggestionDialog submissionId={sid} open={isSuggestionOpen} onClose={closeSuggestions} />
      )}

      {isAssignmentsOpen && sid && (
        <SubmissionAssignmentsDialog isOpen={isAssignmentsOpen} submissionId={sid} onClose={closeAssignments} />
      )}

      <ReviewsModal
        open={showReviewsModal}
        onClose={closeReviews}
        summary={summary as SubmissionReviewSummaryDTO | undefined}
        loading={loadingSummary}
        onOpenRefetch={async () => {
          try {
            await refetchSummary?.();
          } catch (err: any) {
            toast.error(err?.message ?? "Không thể tải lại summary");
          }
        }}
      />

      {isFinalReviewOpen && sid && (
        <FinalReviewDialog
          isOpen={isFinalReviewOpen}
          onClose={closeFinalReview}
          submissionId={sid}
          onSuccess={async () => {
            try {
              if (topicId) await refetchTopicDetail?.();
              await refetchSummary?.();
            } catch {
              // ignore
            }
          }}
        />
      )}
    </div>
  );
}
