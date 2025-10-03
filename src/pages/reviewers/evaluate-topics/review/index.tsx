import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingPage from "@/pages/loading-page";
import { useSubmissionDetail } from "@/hooks/useSubmission";
import { useTopicDetail } from "@/hooks/useTopic";
import { useMyAssignments } from "@/hooks/useReviewerAssignment";
import { useCriteria } from "@/hooks/useEvaluationCriteria";
import TopicSubmissionDetail from "./TopicSubmissionDetail";
import ReviewForm from "./ReviewForm";
import AICheckSection from "@/pages/moderators/submissions/components/AICheckSection";

export default function ReviewerReviewEditor() {
  const [qs] = useSearchParams();
  const assignmentId = qs.get("assignmentId") ?? undefined;
  const submissionIdFromQs = qs.get("submissionId") ?? undefined;
  const reviewId = qs.get("reviewId") ?? undefined;

  const { data: submissionDetail, isLoading: subLoading } = useSubmissionDetail(
    submissionIdFromQs ?? undefined
  );

  const { data: myAssignments } = useMyAssignments();
  const submissionIdFromAssignment = useMemo(() => {
    if (!assignmentId || !Array.isArray(myAssignments)) return undefined;
    const found = myAssignments.find((a: any) => String(a.id) === String(assignmentId) || String(a.assignmentId) === String(assignmentId));
    return found?.submissionId ?? undefined;
  }, [assignmentId, myAssignments]);

  const effectiveSubmissionId = submissionIdFromQs ?? submissionIdFromAssignment;
  const { data: submissionDetailFromAssignment, isLoading: subLoading2 } = useSubmissionDetail(effectiveSubmissionId ?? undefined);

  const finalSubmissionDetail = submissionDetail ?? submissionDetailFromAssignment;
  const topicId = finalSubmissionDetail?.topicId ?? undefined;
  const { data: topicDetail, isLoading: topicLoading } = useTopicDetail(topicId);
  const { data: criteriaPaged } = useCriteria({ PageNumber: 1, PageSize: 100, Keyword: null });
  const criteriaList = criteriaPaged?.listObjects ?? [];

  const isLoading = subLoading || subLoading2 || topicLoading;

  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: topic + submission details + AI check */}
        <div className="space-y-4">
          <TopicSubmissionDetail
            submissionDetail={finalSubmissionDetail}
            topicDetail={topicDetail}
          />
        </div>

        {/* Right: review form */}
        <div>
          <ReviewForm
            assignmentId={assignmentId ? Number(assignmentId) : undefined}
            reviewId={reviewId ? Number(reviewId) : undefined}
            criteriaList={criteriaList}
          />
        </div>
      </div>
    </div>
  );
}
