import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSubmissionReviewSummary,
  moderatorFinalReview,
  type SubmissionReviewSummaryDTO,
  type IdLike,
} from "@/services/submissionReviewService";

export const useSubmissionReviewSummary = (submissionId?: IdLike) =>
  useQuery<SubmissionReviewSummaryDTO, Error>({
    queryKey: ["submission-review-summary", submissionId ?? null],
    queryFn: () => getSubmissionReviewSummary(submissionId!),
    enabled: !!submissionId,
    staleTime: 60 * 1000,
  });

export const useModeratorFinalReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: moderatorFinalReview,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["submission-review-summary", vars.submissionId] });
      qc.invalidateQueries({ queryKey: ["submission-reviews", vars.submissionId] });
    },
  });
};
