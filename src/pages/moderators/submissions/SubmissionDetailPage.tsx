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
} from "@/hooks/useReviewerAssignment";

import ReviewerPickerDialog from "./ReviewerPickerDialog";
import SubmissionAssignmentsDialog from "./SubmissionAssignmentsDialog";
import ReviewerSuggestionDialog from "./ReviewerSuggestionDialog";

import AICheckSection from "./components/AICheckSection";
import ReviewsModal from "./components/ReviewsModal";
import SidebarActions from "./components/SidebarActions";
import FinalReviewDialog from "./components/FinalReviewDialog";
import SubmissionsListTable from "./SubmissionsListTable";

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

/* --- Route state typing --- */
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

  // typed state
  const typedState = state as RouteState;
  const initialRow = (typedState?.row as SubmissionListItem | undefined) ?? undefined;

  const sid: number | undefined = submissionId ? Number(submissionId) : undefined;

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);

  // ---- submission short detail (use number id) ----
  // Note: ensure your hook supports number | undefined; if not, change to sid?.toString()
  const { data: submissionDetailShort } = useSubmissionDetail(sid);

  // topicId from state or submission short (typed)
  const topicIdFromState = typedState?.topicId ?? (submissionDetailShort as any)?.topicId ?? undefined;
  const topicId: number | undefined = topicIdFromState ? Number(topicIdFromState) : undefined;

  // full topic detail via hook
  const { data: topicDetailResponse, refetch: refetchTopicDetail } = useTopicDetail(topicId);
  const topicDetail = topicDetailResponse as TopicDetailResponse | undefined;

  // use existing summary hook (already in your hooks)
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useSubmissionReviewSummary(sid);

  // choose selected submission
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

  // seed cache for submission-detail so useSubmissionDetail reads immediate
  useEffect(() => {
    const id = selectedSubmission?.id;
    if (!id) return;
    // only seed if no cached data to avoid overwriting a fresher cache
    const existing = qc.getQueryData(["submission-detail", id]);
    if (!existing) {
      qc.setQueryData(["submission-detail", id], selectedSubmission);
    }
  }, [qc, selectedSubmission]);

  // reviewer/assignment hooks
  const { data: assignments, isLoading: loadingAssignments } = useAssignmentsBySubmission(sid);
  const { data: availableReviewers, isLoading: loadingAvailable } = useAvailableReviewers(isPickerOpen ? sid : undefined);
  const bulkAssign = useBulkAssignReviewers();

  // header
  const header = {
    id: sid,
    code: String(initialRow?.id ?? submissionId ?? ""),
    title: initialRow?.topicTitle ?? topicDetail?.eN_Title ?? topicDetail?.vN_title ?? `Submission #${submissionId ?? "-"}`,
    submittedByName: (selectedSubmission as any)?.submittedByName ?? "-",
    round: (selectedSubmission as any)?.submissionRound ?? "-",
    submittedAt: (selectedSubmission as any)?.submittedAt ?? "-",
  };

  // open/close reviews (uses summary hook already)
  const openReviews = async () => {
    setShowReviewsModal(true);
    try {
      await refetchSummary?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Không thể tải review summary");
    }
  };
  const closeReviews = () => setShowReviewsModal(false);

  const openPicker = () => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    setIsPickerOpen(true);
  };
  const closePicker = () => setIsPickerOpen(false);

  const openAssignments = () => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    setIsAssignmentsOpen(true);
  };
  const closeAssignments = () => setIsAssignmentsOpen(false);

  const openSuggestions = () => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    setIsSuggestionOpen(true);
  };
  const closeSuggestions = () => setIsSuggestionOpen(false);

  const openFinalReview = () => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    setIsFinalReviewOpen(true);
  };
  const closeFinalReview = () => setIsFinalReviewOpen(false);

  // handle assign
  const handleConfirmAssign = async (selectedReviewerIds: (number | string)[]) => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    const reviewerIds = selectedReviewerIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    try {
      await bulkAssign.mutateAsync({ submissionId: sid, reviewerIds } as any);

      // invalidate only relevant keys (ensure hooks use same key structure)
      if (topicId) qc.invalidateQueries({ queryKey: ["topicDetail", topicId] });
      qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
      qc.invalidateQueries({ queryKey: ["assignments", sid] });
      qc.invalidateQueries({ queryKey: ["submission-detail", sid] });

      toast.success("Phân công reviewer thành công");
      if (showReviewsModal) {
        try {
          await refetchSummary?.();
        } catch {
          /* ignore */
        }
      }
      closePicker();
    } catch (err: any) {
      toast.error(err?.message ?? "Phân công reviewer thất bại");
    }
  };

  // navigate to a submission within same topic (seed cache first)
  const goToSubmission = (id: number) => {
    const s = (topicDetail?.submissions ?? []).find((x) => x.id === id);
    if (s) qc.setQueryData(["submission-detail", id], s);
    navigate(`/moderators/submissions/${id}`, { state: { topicId, topicDetail } });
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
        <div>
          <button
            type="button"
            className="inline-flex items-center rounded border px-3 py-2"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/moderators/submissions"))}
          >
            ← Trở về
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">{header.title}</h2>
              <div className="text-sm text-slate-500">
                #{header.code} • {header.submittedByName}
              </div>
            </div>
            <div className="ml-auto" />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Left */}
            <div className="md:col-span-2 space-y-4 min-w-0">
              {/* Topic info card */}
              <div className="bg-white border rounded-md p-4 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">Topic</div>
                    <div className="text-base font-medium mt-1">{topicDetail?.eN_Title ?? topicDetail?.vN_title ?? "—"}</div>
                    <div className="text-xs text-slate-500 mt-1">{topicDetail?.description ?? "—"}</div>
                  </div>

                  <div className="text-sm text-right">
                    <div className="mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass(topicDetail?.latestSubmissionStatus ?? "")}`}>
                        {topicDetail?.latestSubmissionStatus ?? "—"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Max students: {topicDetail?.maxStudents ?? "—"}</div>
                    <div className="text-xs text-slate-500">Has submitted: {topicDetail?.hasSubmitted ? "Yes" : "No"}</div>
                    <div className="text-xs text-slate-500 mt-2">Created: {topicDetail?.createdAt ? new Date(topicDetail.createdAt).toLocaleString() : "—"}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
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
                    <div className="font-medium">{topicDetail?.supervisorName ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Document</div>
                    <div>
                      {topicDetail?.documentUrl ? (
                        <a href={topicDetail.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                          Open document
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected submission */}
              <div className="bg-white border rounded-md p-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Selected Submission</div>
                  <div className="text-xs text-slate-500">Round: {selectedSubmission?.submissionRound ?? "—"}</div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium">{selectedSubmission?.submittedByName ?? selectedSubmission?.submittedBy ?? "—"}</div>
                  <div className="text-sm text-slate-600 mt-2">
                    Status:{" "}
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColorClass(selectedSubmission?.status ?? "")}`}>
                      {selectedSubmission?.status ?? "—"}
                    </span>
                    {" • "}
                    Submitted at: {selectedSubmission?.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : "—"}
                  </div>

                  <div className="mt-3 text-sm text-slate-700">
                    <div className="font-medium">Additional notes</div>
                    <div className="text-sm text-slate-600 mt-1">{selectedSubmission?.additionalNotes ?? "—"}</div>
                  </div>

                  {selectedSubmission?.documentUrl && (
                    <div className="mt-3">
                      <a href={selectedSubmission.documentUrl} rel="noreferrer" target="_blank" className="text-sm text-blue-600 underline">
                        View submission document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <AICheckSection submissionDetail={selectedSubmission} />

              {/* Extracted table component */}
              <div className="bg-white border rounded-md p-4 w-full">
                <SubmissionsListTable
                  submissions={topicDetail?.submissions ?? []}
                  onView={goToSubmission}
                />
              </div>
            </div>

            {/* Right */}
            <aside className="space-y-4 min-w-0">
              <SidebarActions
                assignments={assignments}
                loadingAssignments={loadingAssignments}
                showReviews={!!showReviewsModal}
                toggleShowReviews={() => {
                  if (!showReviewsModal) openReviews();
                  else closeReviews();
                }}
                onOpenPicker={openPicker}
                onOpenSuggestions={openSuggestions}
                onOpenAssignments={openAssignments}
                onOpenFinalReview={openFinalReview}
                submissionId={sid}
                onRefreshTopicDetail={refreshTopicDetail}
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
          onConfirm={(ids) => handleConfirmAssign(ids)}
          loading={bulkAssign.isLoading || loadingAvailable}
        />
      )}

      {isSuggestionOpen && sid && (
        <ReviewerSuggestionDialog
          submissionId={sid}
          open={isSuggestionOpen}
          onClose={closeSuggestions}
        />
      )}

      {isAssignmentsOpen && sid && (
        <SubmissionAssignmentsDialog
          isOpen={isAssignmentsOpen}
          submissionId={sid}
          onClose={closeAssignments}
        />
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
