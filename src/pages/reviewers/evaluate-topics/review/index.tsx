import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingPage from "@/pages/loading-page";
import { useSubmissionDetail } from "@/hooks/useSubmission";
import { useTopicDetail } from "@/hooks/useTopic";
import { useMyAssignments } from "@/hooks/useReviewerAssignment";
import { useCriteria } from "@/hooks/useEvaluationCriteria";
import ReviewForm from "./ReviewForm";
import ReviewerTopicSummary from "./ReviewerTopicSummary"; 

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
  const { data: submissionDetailFromAssignment, isLoading: subLoading2 } =
    useSubmissionDetail(
      effectiveSubmissionId ? String(effectiveSubmissionId) : undefined
    );
  const finalSubmissionDetail = submissionDetail ?? submissionDetailFromAssignment;
  const topicId = finalSubmissionDetail?.topicId ?? undefined;
  const { data: topicDetail, isLoading: topicLoading } = useTopicDetail(
    topicId ? String(topicId) : undefined
  );
  const { data: criteriaPaged } = useCriteria({
    PageNumber: 1,
    PageSize: 100,
    Keyword: undefined,
  }); const criteriaList = criteriaPaged?.listObjects ?? [];

  const isLoading = subLoading || subLoading2 || topicLoading;

  if (isLoading) return <LoadingPage />;

  return (
    <div className="p-3 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: topic summary + submission details + AI check */}
        <div className="space-y-4">
          <ReviewerTopicSummary
            topicDetail={topicDetail}
            submissionDetail={finalSubmissionDetail}
            showAISection
          />
        </div>
        {/* Right: review form */}
        <div>
          <ReviewForm
            assignmentId={Number(assignmentId)}
            reviewId={reviewId ? Number(reviewId) : undefined}
            criteriaList={criteriaList}
          />
        </div>
      </div>
    </div>
  );
}
