// src/pages/moderators/submissions/SubmissionDetailPage.tsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSubmissionReviewSummary, type SubmissionReviewSummaryDTO } from "@/services/submissionReviewService";
import { useSubmissionDetail } from "@/hooks/useSubmission";
import type { SubmissionListItem } from "@/services/submissionService";
import {
  useBulkAssignReviewers,
  useAvailableReviewers,
  useAssignmentsBySubmission,
} from "@/hooks/useReviewerAssignment";

import ReviewerPickerDialog from "./ReviewerPickerDialog";
import SubmissionAssignmentsDialog from "./SubmissionAssignmentsDialog";
import ReviewerSuggestionDialog from "./ReviewerSuggestionDialog";

import AICheckSection from "./components/AICheckSection";
import ReviewsSection from "./components/ReviewsSection";
import SidebarActions from "./components/SidebarActions";

export default function SubmissionDetailPage() {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { state } = useLocation();
  const initialRow = (state?.row as SubmissionListItem | undefined) ?? undefined;

  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const { data: submissionDetail } = useSubmissionDetail(submissionId);
  const bulkAssign = useBulkAssignReviewers();

  const { data: assignments, isLoading: loadingAssignments } = useAssignmentsBySubmission(submissionId);
  const { data: availableReviewers } = useAvailableReviewers(isPickerOpen ? submissionId : undefined);

  // lazy load reviews summary
  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useQuery<SubmissionReviewSummaryDTO, Error>({
    queryKey: ["submission-review-summary", submissionId ?? null],
    queryFn: async () => {
      const res = await getSubmissionReviewSummary(submissionId!);
      return res;
    },
    enabled: false,
  });

  const header = {
    id: submissionId,
    code: String(initialRow?.id ?? submissionId),
    title: initialRow?.topicTitle ?? (submissionDetail as any)?.topicTitle ?? `Submission #${submissionId}`,
    submittedByName: initialRow?.submittedByName ?? (submissionDetail as any)?.submittedByName ?? "-",
    round: initialRow?.submissionRound ?? (submissionDetail as any)?.submissionRound ?? "-",
    submittedAt: initialRow?.submittedAt ?? (submissionDetail as any)?.submittedAt ?? "-",
  };

  const toggleShowReviews = async () => {
    const next = !showReviews;
    setShowReviews(next);
    if (next) await refetchSummary();
  };

  const openPicker = () => setIsPickerOpen(true);
  const closePicker = () => setIsPickerOpen(false);
  const openAssignments = () => setIsAssignmentsOpen(true);
  const closeAssignments = () => setIsAssignmentsOpen(false);
  const openSuggestions = () => setIsSuggestionOpen(true);
  const closeSuggestions = () => setIsSuggestionOpen(false);

  const handleConfirmAssign = async (selectedReviewerIds: (number | string)[]) => {
    if (!submissionId) return;
    try {
      await bulkAssign.mutateAsync({ submissionId, reviewerIds: selectedReviewerIds } as any);
      if (showReviews) refetchSummary();
      closePicker();
    } catch {
      closePicker();
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
              <div className="text-sm text-slate-500">#{header.code} • {header.submittedByName}</div>
            </div>
            <div className="ml-auto" />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* Left */}
            <div className="md:col-span-2 space-y-4 min-w-0">
              <div className="bg-white border rounded-md p-4 w-full overflow-x-auto">
                <div className="text-sm font-semibold mb-2">Topic</div>
                <div className="text-base">{(submissionDetail as any)?.topicTitle ?? "—"}</div>
                <div className="mt-3 text-sm text-slate-500">
                  {(submissionDetail as any)?.additionalNotes ?? "No notes."}
                </div>
              </div>

              <AICheckSection submissionDetail={submissionDetail} />

              {/* ReviewsSection component */}
              <ReviewsSection
                showReviews={showReviews}
                loadingSummary={loadingSummary}
                summary={summary}
                onToggleShowReviews={toggleShowReviews}
              />
            </div>

            {/* Right */}
            <aside className="space-y-4 min-w-0">
              <SidebarActions
                assignments={assignments}
                loadingAssignments={loadingAssignments}
                showReviews={showReviews}
                toggleShowReviews={toggleShowReviews}
                onOpenPicker={openPicker}
                onOpenSuggestions={openSuggestions}
                onOpenAssignments={openAssignments}
                submissionId={submissionId}
              />
            </aside>
          </div>
        </div>
      </div>

      {/* dialogs */}
      {isPickerOpen && submissionId && (
        <ReviewerPickerDialog
          isOpen={isPickerOpen}
          submissionId={submissionId}
          availableReviewers={availableReviewers ?? []}
          onClose={closePicker}
          onConfirm={(ids) => handleConfirmAssign(ids)}
        />
      )}

      {isSuggestionOpen && submissionId && (
        <ReviewerSuggestionDialog
          submissionId={Number(submissionId)}
          open={isSuggestionOpen}
          onClose={closeSuggestions}
        />
      )}

      {isAssignmentsOpen && submissionId && (
        <SubmissionAssignmentsDialog
          isOpen={isAssignmentsOpen}
          submissionId={submissionId}
          onClose={closeAssignments}
        />
      )}
    </div>
  );
}
