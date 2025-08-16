import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignReviewer,
  autoAssignReviewers,
  bulkAssignReviewers,
  cancelAssignment,
  getAssignmentsBySubmission,
  getAvailableReviewers,
  getRecommendedReviewers,
  updateAssignmentStatus,
  type AssignReviewerDTO,
  type AutoAssignReviewerDTO,
  type AvailableReviewerDTO,
  type BulkAssignReviewerDTO,
  type IdLike,
  type RecommendationQuery,
  type RecommendedReviewerDTO,
  type ReviewerAssignmentResponseDTO,
  AssignmentStatus,
} from "@/services/reviewerAssignmentService";

export function useAvailableReviewers(submissionId?: IdLike) {
  const key = submissionId == null ? "" : String(submissionId);
  return useQuery<AvailableReviewerDTO[], Error>({
    queryKey: ["availableReviewers", key],
    queryFn: () => getAvailableReviewers(submissionId!),
    enabled: submissionId != null && key !== "",
  });
}

export function useAssignmentsBySubmission(submissionId?: IdLike) {
  const key = submissionId == null ? "" : String(submissionId);
  return useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignmentsBySubmission", key],
    queryFn: () => getAssignmentsBySubmission(submissionId!),
    enabled: submissionId != null && key !== "",
  });
}

export function useAssignReviewer() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO, Error, AssignReviewerDTO>({
    mutationFn: (payload) => assignReviewer(payload),
    onSuccess: (_data, vars) => {
      const k = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", k] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", k] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers", k] });
    },
  });
}

export function useBulkAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<
    ReviewerAssignmentResponseDTO[],
    Error,
    BulkAssignReviewerDTO
  >({
    mutationFn: (payload) => bulkAssignReviewers(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers"] });
    },
  });
}

export function useUpdateAssignmentStatus() {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { assignmentId: IdLike; status: AssignmentStatus }
  >({
    mutationFn: ({ assignmentId, status }) =>
      updateAssignmentStatus(assignmentId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

export function useCancelAssignment() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: (assignmentId) => cancelAssignment(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

export function useAutoAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<
    ReviewerAssignmentResponseDTO[],
    Error,
    AutoAssignReviewerDTO
  >({
    mutationFn: (payload) => autoAssignReviewers(payload),
    onSuccess: (_data, vars) => {
      const k = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", k] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", k] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers", k] });
    },
  });
}

export function useRecommendedReviewers(
  submissionId?: IdLike,
  query?: RecommendationQuery,
) {
  const key = submissionId == null ? "" : String(submissionId);
  return useQuery<RecommendedReviewerDTO[], Error>({
    queryKey: [
      "recommendedReviewers",
      key,
      query?.minSkillScore ?? null,
      query?.maxWorkload ?? null,
    ],
    queryFn: () => getRecommendedReviewers(submissionId!, query),
    enabled: submissionId != null && key !== "",
  });
}
