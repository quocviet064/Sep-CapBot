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
import TopicSummaryCard from "./components/TopicSummaryCard";

export default function SubmissionDetailPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { submissionId: submissionIdParam } = useParams<{ submissionId: string }>();
  const { state } = useLocation();

  const typedState = state as
    | {
        topicId?: number;
        row?: SubmissionListItem;
        topicDetail?: TopicDetailResponse;
        topicVersionId?: number;
      }
    | undefined;

  const initialRow = typedState?.row;
  const sid = submissionIdParam ? Number(submissionIdParam) : undefined;

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsModalSubmissionId, setReviewsModalSubmissionId] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const { data: submissionDetailShort } = useSubmissionDetail(sid);

  const topicId =
    typedState?.topicId ?? (submissionDetailShort as any)?.topicId ?? undefined;
  const { data: topicDetailResponse, refetch: refetchTopicDetail } =
    useTopicDetail(topicId);
  const topicDetail = topicDetailResponse as TopicDetailResponse | undefined;

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } =
    useSubmissionReviewSummary(sid);

  const selectedSubmission = useMemo<SubmissionDTO | undefined>(() => {
    if (!topicDetail)
      return (initialRow ?? (submissionDetailShort as any)) as SubmissionDTO;
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
    return sorted[0] ?? (initialRow as SubmissionDTO);
  }, [topicDetail, sid, initialRow, submissionDetailShort]);

  useEffect(() => {
    const id = selectedSubmission?.id;
    if (!id) return;
    const existing = qc.getQueryData(["submission-detail", id]);
    if (!existing) {
      qc.setQueryData(["submission-detail", id], selectedSubmission);
    }
  }, [qc, selectedSubmission]);

  const { data: assignments, isLoading: loadingAssignments } =
    useAssignmentsBySubmission(sid);
  const { data: availableReviewers, isLoading: loadingAvailable } =
    useAvailableReviewers(isPickerOpen ? sid : undefined);
  const bulkAssign = useBulkAssignReviewers();
  const cancelAssignment = useCancelAssignment();

  // ----- Detect escalated state robustly -----
  const latestSubmissionStatus = (topicDetail as any)?.latestSubmissionStatus;
  const currentVersionStatus = (topicDetail as any)?.currentVersionStatus;
  const topStatus = (topicDetail as any)?.status;

  const anySubmissionEscalated =
    Array.isArray((topicDetail as any)?.submissions) &&
    ((topicDetail as any).submissions as any[]).some(
      (s) => String(s?.status) === "EscalatedToModerator"
    );

  const isEscalated =
    String(latestSubmissionStatus) === "EscalatedToModerator" ||
    String(currentVersionStatus) === "EscalatedToModerator" ||
    String(topStatus) === "EscalatedToModerator" ||
    anySubmissionEscalated;

  // business rule: default required reviewers; escalated allows +1 reviewer
  const requiredReviewers = (topicDetail as any)?.requiredReviewers ?? 2;
  const assignedCount = (assignments ?? []).length;
  const maxAllowedReviewers = requiredReviewers + (isEscalated ? 1 : 0);
  const remainingSlots = Math.max(0, maxAllowedReviewers - assignedCount);

  const isAssignDisabled = remainingSlots <= 0;

  const openReviewsForSubmission = async (submissionToOpen?: number | null) => {
    const target = submissionToOpen ?? sid ?? null;
    if (!target) {
      toast.error("Submission ID không hợp lệ để xem review");
      return;
    }
    setReviewsModalSubmissionId(Number(target));
    setShowReviewsModal(true);
    if (Number(target) === Number(sid)) {
      try {
        await refetchSummary?.();
      } catch (err: any) {
        // ignore or show toast
        toast.error(err?.message ?? "Không thể tải summary");
      }
    }
  };

  const handleConfirmAssign = async (arg: any) => {
    if (!sid) return toast.error("Submission ID không hợp lệ");
    if (isAssignDisabled)
      return toast.error(`Đã có ${assignedCount} reviewer. Không thể phân công thêm.`);
    let payload: any;
    if (Array.isArray(arg)) {
      payload = {
        assignments: arg.map((rid: any) => ({
          submissionId: sid,
          reviewerId: rid,
          assignmentType: 1,
        })),
      };
    } else if (arg?.reviewerIds) {
      payload = {
        assignments: arg.reviewerIds.map((rid: any) => ({
          submissionId: sid,
          reviewerId: rid,
          assignmentType: 1,
          deadline: arg.deadline,
        })),
      };
    } else return ;

    setAssigning(true);
    try {
      await bulkAssign.mutateAsync(payload);
      toast.success("Phân công reviewer thành công");
      if (topicId) qc.invalidateQueries({ queryKey: ["topicDetail", topicId] });
      qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
      qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
      qc.invalidateQueries({ queryKey: ["submission-list"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Phân công thất bại");
    } finally {
      setAssigning(false);
      setIsPickerOpen(false);
    }
  };

  const handleRemoveAssignment = (assignmentId?: number | string) => {
    if (!assignmentId) return toast.error("Assignment ID không hợp lệ");
    const ok = window.confirm("Bạn có chắc muốn huỷ phân công reviewer này không?");
    if (!ok) return;
    cancelAssignment.mutate(assignmentId, {
      onSuccess: () => {
        toast.success("Đã huỷ phân công reviewer");
        if (sid) {
          qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
          qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
          qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
        }
      },
      onError: (err: any) =>
        toast.error(err?.message ?? "Không thể huỷ phân công"),
    });
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4 min-w-0">
              <TopicSummaryCard displayedTopic={topicDetail} topicDetail={topicDetail} />
              <AICheckSection submissionDetail={selectedSubmission} />
            </div>

            <aside className="space-y-4 min-w-0">
              <SidebarActions
                assignments={assignments ?? []}
                loadingAssignments={loadingAssignments}
                showReviews={showReviewsModal}
                toggleShowReviews={() =>
                  !showReviewsModal
                    ? openReviewsForSubmission()
                    : setShowReviewsModal(false)
                }
                onOpenPicker={() => setIsPickerOpen(true)}
                onOpenSuggestions={() => setIsSuggestionOpen(true)}
                onOpenAssignments={() =>
                  qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] })
                }
                onOpenFinalReview={() => setIsFinalReviewOpen(true)}
                submissionId={sid}
                onRemoveAssignment={handleRemoveAssignment}
                reviewSummary={summary}
                isAssignDisabled={isAssignDisabled}
                remainingSlots={remainingSlots}
                isEscalated={isEscalated}
              />
            </aside>
          </div>
        </div>
      </div>

      {isPickerOpen && sid && (
        <ReviewerPickerDialog
          isOpen={isPickerOpen}
          submissionId={sid}
          availableReviewers={availableReviewers ?? []}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={handleConfirmAssign}
          loading={bulkAssign.isPending || loadingAvailable || assigning}
          confirmDisabled={isAssignDisabled || assigning}
          assignedCount={assignedCount}
          requiredReviewers={requiredReviewers}
          remainingSlots={remainingSlots}
        />
      )}

      {isSuggestionOpen && sid && (
        <ReviewerSuggestionDialog
          submissionId={sid}
          open={isSuggestionOpen}
          onClose={() => setIsSuggestionOpen(false)}
        />
      )}

      <ReviewsModal
        open={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        submissionId={reviewsModalSubmissionId ?? undefined}
        summary={
          reviewsModalSubmissionId !== null && Number(reviewsModalSubmissionId) === Number(sid ?? -1)
            ? (summary as SubmissionReviewSummaryDTO | undefined)
            : undefined
        }
        loading={
          reviewsModalSubmissionId !== null && Number(reviewsModalSubmissionId) === Number(sid ?? -1)
            ? loadingSummary
            : undefined
        }
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
          onClose={() => setIsFinalReviewOpen(false)}
          submissionId={sid}
          onSuccess={async () => {
            // refresh
            try {
              setIsFinalReviewOpen(false);
              qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
              qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
              qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
              qc.invalidateQueries({ queryKey: ["submission-list"] });
              if (topicId) await refetchTopicDetail?.();
              await refetchSummary?.();

              toast.success("Lưu quyết định Moderator thành công");
            } catch (err: any) {
              toast.error(err?.message ?? "Đã xảy ra lỗi khi cập nhật trang");
            }
          }}
        />
      )}
    </div>
  );
}
