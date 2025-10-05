import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  aiSuggest,
  suggestBySubmission,
  getTopReviewers,
  checkEligibilityByTopic,
  type ReviewerSuggestionInputDTO,
  type ReviewerSuggestionBySubmissionInputDTO,
  type ReviewerSuggestionByTopicInputDTO,
  type ReviewerSuggestionOutputDTO,
  type ReviewerSuggestionDTO,
  type ReviewerEligibilityDTO,
  type IdLike,
} from "@/services/reviewerSuggestionService";

/** useAiSuggest */
export const useAiSuggest = (opts?: {
  onSuccess?: (data: ReviewerSuggestionOutputDTO) => void;
  onError?: (err: unknown) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ReviewerSuggestionInputDTO>) => aiSuggest(input),
    onSuccess: (data) => {
      toast.success("Gợi ý AI hoàn tất");
      qc.invalidateQueries({ queryKey: ["reviewer-suggestion"] });
      opts?.onSuccess?.(data);
    },
    onError: (err) => {
      toast.error("Gợi ý AI thất bại");
      opts?.onError?.(err);
    },
  });
};

/** useSuggestBySubmission*/
export const useSuggestBySubmission = (opts?: {
  onSuccess?: (data: ReviewerSuggestionOutputDTO) => void;
  onError?: (err: unknown) => void;
}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { input: ReviewerSuggestionBySubmissionInputDTO; assign?: boolean }) =>
      suggestBySubmission(vars.input, !!vars.assign),
    onSuccess: (data) => {
      toast.success("Gợi ý theo submission hoàn tất");
      qc.invalidateQueries({ queryKey: ["reviewer-suggestion", "by-submission"] });
      opts?.onSuccess?.(data);
    },
    onError: (err) => {
      toast.error("Gợi ý theo submission thất bại");
      opts?.onError?.(err);
    },
  });
};

/** useTopReviewers */
export const useTopReviewers = (submissionId?: IdLike, count = 5, enabled = true) =>
  useQuery<ReviewerSuggestionDTO[], Error>({
    queryKey: ["reviewer-suggestion", "top", submissionId ?? null, count],
    queryFn: () => getTopReviewers(Number(submissionId), count),
    enabled: !!submissionId && enabled,
    staleTime: 1000 * 60 * 2,
  });

/** useCheckEligibilityByTopic */
export const useCheckEligibilityByTopic = (reviewerId?: IdLike, topicId?: IdLike, enabled = true) =>
  useQuery<ReviewerEligibilityDTO, Error>({
    queryKey: ["reviewer-suggestion", "eligibility", reviewerId ?? null, topicId ?? null],
    queryFn: () => checkEligibilityByTopic(reviewerId!, topicId!),
    enabled: !!reviewerId && !!topicId && enabled,
    staleTime: 1000 * 60 * 5,
  });

/** Helper: convenience query to call suggestBySubmission in a query-style (not persisted) */
export const useSuggestBySubmissionQuery = (input?: ReviewerSuggestionBySubmissionInputDTO, assign = false) =>
  useQuery<ReviewerSuggestionOutputDTO, Error>({
    queryKey: ["reviewer-suggestion", "by-submission", input ? input.SubmissionId ?? null : null, assign],
    queryFn: () => suggestBySubmission(input!, assign),
    enabled: !!input,
    staleTime: 1000 * 60 * 2,
  });
