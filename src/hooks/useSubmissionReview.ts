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
      const id = (vars as any).submissionId;
      qc.invalidateQueries({ queryKey: ["submission-review-summary", id] });
      qc.invalidateQueries({ queryKey: ["submission-reviews", id] });
      qc.invalidateQueries({ queryKey: ["submission-detail", id] });
      qc.invalidateQueries({ queryKey: ["submission-list"] });
    },
  });
};
