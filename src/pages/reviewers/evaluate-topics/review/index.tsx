export default function ReviewerReviewEditor() {
  // lấy assignmentId, reviewId từ query
  // fetch submissionDetail
  const { data: submissionDetail } = useSubmissionDetail(assignmentId ?? undefined);
  const { data: topicDetail } = useTopicDetail(submissionDetail?.topicId);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: detail */}
        <div className="space-y-4">
          <TopicSubmissionDetail
            submissionDetail={submissionDetail}
            topicDetail={topicDetail}
          />
          <AICheckSection submissionDetail={submissionDetail} />
        </div>

        {/* Right: review form */}
        <div>
          <ReviewForm
            assignmentId={assignmentId}
            reviewId={reviewId}
            criteriaList={criteriaList}
          />
        </div>
      </div>
    </div>
  );
}
