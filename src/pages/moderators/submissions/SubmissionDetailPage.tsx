import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSubmissionDetail } from "@/hooks/useSubmission";
import { useTopicDetail } from "@/hooks/useTopic";
import { useSubmissionReviewSummary } from "@/hooks/useSubmissionReview";

import type { SubmissionListItem } from "@/services/submissionService";
import type {
  TopicDetailResponse,
  SubmissionDTO,
} from "@/services/topicService";
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

type LocationState =
  | {
      topicId?: number;
      row?: SubmissionListItem;
      topicDetail?: TopicDetailResponse;
      topicVersionId?: number;
    }
  | undefined;

type TopicLike = {
  latestSubmissionStatus?: string | number | null;
  currentVersionStatus?: string | number | null;
  status?: string | number | null;
  requiredReviewers?: number | null;
  submissions?: Array<{
    id: number;
    status?: string | number | null;
    submittedAt?: string | null;
  }>;
};

type AssignArg = number[] | { reviewerIds: number[]; deadline?: string };
type BulkAssignItem = {
  submissionId: number;
  reviewerId: number;
  assignmentType: number;
  deadline?: string;
};
type BulkAssignPayload = { assignments: BulkAssignItem[] };

function hasTopicId(x: unknown): x is { topicId?: number } {
  return typeof x === "object" && x !== null && "topicId" in x;
}

function hasId(x: unknown): x is { id: number } {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as { id?: unknown }).id === "number"
  );
}

function getErrorMessage(e: unknown, fallback = "Đã xảy ra lỗi"): string {
  if (e instanceof Error) return e.message || fallback;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message?: unknown }).message === "string"
  ) {
    return (e as { message: string }).message || fallback;
  }
  return fallback;
}

export default function SubmissionDetailPage() {
  const qc = useQueryClient();
  const { submissionId: submissionIdParam } = useParams<{
    submissionId: string;
  }>();
  const location = useLocation();
  const typedState = location.state as LocationState;

  const initialRow = typedState?.row;
  const sid = submissionIdParam ? Number(submissionIdParam) : undefined;

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsModalSubmissionId, setReviewsModalSubmissionId] = useState<
    number | null
  >(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isFinalReviewOpen, setIsFinalReviewOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const { data: submissionDetailShort } = useSubmissionDetail(sid);

  const topicIdNum =
    typedState?.topicId ??
    (hasTopicId(submissionDetailShort)
      ? submissionDetailShort.topicId
      : undefined) ??
    undefined;

  const topicIdStr = topicIdNum != null ? String(topicIdNum) : undefined;

  const { data: topicDetailResponse, refetch: refetchTopicDetail } =
    useTopicDetail(topicIdStr);
  const topicDetail = topicDetailResponse as TopicDetailResponse | undefined;

  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useSubmissionReviewSummary(sid);

  const selectedSubmission = useMemo<SubmissionDTO | undefined>(() => {
    if (!topicDetail) {
      if (hasId(initialRow)) return initialRow as unknown as SubmissionDTO;
      if (hasId(submissionDetailShort))
        return submissionDetailShort as unknown as SubmissionDTO;
      return undefined;
    }
    const subs = (topicDetail.submissions ?? []) as SubmissionDTO[];
    if (sid) {
      const found = subs.find((s) => s.id === sid);
      if (found) return found;
    }
    const sorted = subs.slice().sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return tb - ta;
    });
    if (sorted[0]) return sorted[0];
    if (hasId(initialRow)) return initialRow as unknown as SubmissionDTO;
    if (hasId(submissionDetailShort))
      return submissionDetailShort as unknown as SubmissionDTO;
    return undefined;
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

  const t = topicDetail as unknown as TopicLike | undefined;
  const latestSubmissionStatus = t?.latestSubmissionStatus;
  const currentVersionStatus = t?.currentVersionStatus;
  const topStatus = t?.status;

  const subsArray = Array.isArray(t?.submissions) ? (t?.submissions ?? []) : [];
  const anySubmissionEscalated = subsArray.some(
    (s) => String(s?.status) === "EscalatedToModerator",
  );

  const isEscalated =
    String(latestSubmissionStatus) === "EscalatedToModerator" ||
    String(currentVersionStatus) === "EscalatedToModerator" ||
    String(topStatus) === "EscalatedToModerator" ||
    anySubmissionEscalated;

  const requiredReviewers =
    typeof t?.requiredReviewers === "number" ? t.requiredReviewers : 2;
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
      } catch (e) {
        void e;
      }
    }
  };

  const handleConfirmAssign = async (arg: AssignArg) => {
    if (!sid) {
      toast.error("Submission ID không hợp lệ");
      return;
    }
    if (isAssignDisabled) {
      toast.error(`Đã có ${assignedCount} reviewer. Không thể phân công thêm.`);
      return;
    }
    let payload: BulkAssignPayload | null = null;
    if (Array.isArray(arg)) {
      payload = {
        assignments: arg.map((rid) => ({
          submissionId: sid,
          reviewerId: rid,
          assignmentType: 1,
        })),
      };
    } else if (Array.isArray(arg.reviewerIds)) {
      payload = {
        assignments: arg.reviewerIds.map((rid) => ({
          submissionId: sid,
          reviewerId: rid,
          assignmentType: 1,
          deadline: arg.deadline,
        })),
      };
    }
    if (!payload) return;

    setAssigning(true);
    try {
      await bulkAssign.mutateAsync(payload);
      toast.success("Phân công reviewer thành công");
      if (topicIdStr)
        qc.invalidateQueries({ queryKey: ["topicDetail", topicIdStr] });
      qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
      qc.invalidateQueries({ queryKey: ["submission-review-summary", sid] });
      qc.invalidateQueries({ queryKey: ["submission-list"] });
    } catch (err) {
      toast.error(getErrorMessage(err, "Phân công thất bại"));
    } finally {
      setAssigning(false);
      setIsPickerOpen(false);
    }
  };

  const handleRemoveAssignment = (assignmentId?: number | string) => {
    if (!assignmentId) {
      toast.error("Assignment ID không hợp lệ");
      return;
    }
    const ok = window.confirm(
      "Bạn có chắc muốn huỷ phân công reviewer này không?",
    );
    if (!ok) return;
    cancelAssignment.mutate(assignmentId, {
      onSuccess: () => {
        toast.success("Đã huỷ phân công reviewer");
        if (sid) {
          qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
          qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
          qc.invalidateQueries({
            queryKey: ["submission-review-summary", sid],
          });
        }
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, "Không thể huỷ phân công")),
    });
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="min-w-0 space-y-4 md:col-span-2">
              <TopicSummaryCard
                displayedTopic={topicDetail}
                topicDetail={topicDetail}
              />
              <AICheckSection submissionDetail={selectedSubmission} />
            </div>

            <aside className="min-w-0 space-y-4">
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
                  qc.invalidateQueries({
                    queryKey: ["assignmentsBySubmission", sid],
                  })
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
          reviewsModalSubmissionId !== null &&
          Number(reviewsModalSubmissionId) === Number(sid ?? -1)
            ? (summary as SubmissionReviewSummaryDTO | undefined)
            : undefined
        }
        loading={
          reviewsModalSubmissionId !== null &&
          Number(reviewsModalSubmissionId) === Number(sid ?? -1)
            ? loadingSummary
            : undefined
        }
        onOpenRefetch={async () => {
          try {
            await refetchSummary?.();
          } catch (err) {
            toast.error(getErrorMessage(err, "Không thể tải lại summary"));
          }
        }}
      />

      {isFinalReviewOpen && sid && (
        <FinalReviewDialog
          isOpen={isFinalReviewOpen}
          onClose={() => setIsFinalReviewOpen(false)}
          submissionId={sid}
          onSuccess={async () => {
            try {
              setIsFinalReviewOpen(false);
              qc.invalidateQueries({ queryKey: ["submission-detail", sid] });
              qc.invalidateQueries({
                queryKey: ["submission-review-summary", sid],
              });
              qc.invalidateQueries({
                queryKey: ["assignmentsBySubmission", sid],
              });
              qc.invalidateQueries({ queryKey: ["submission-list"] });
              if (topicIdStr) await refetchTopicDetail?.();
              await refetchSummary?.();
              toast.success("Lưu quyết định Moderator thành công");
            } catch (err) {
              toast.error(
                getErrorMessage(err, "Đã xảy ra lỗi khi cập nhật trang"),
              );
            }
          }}
        />
      )}
    </div>
  );
}
