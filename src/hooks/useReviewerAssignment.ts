import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignReviewer,
  autoAssignReviewers,
  bulkAssignReviewers,
  cancelAssignment,
  getAssignmentsBySubmission,
  getAssignmentsByReviewer,
  getAvailableReviewers,
  getRecommendedReviewers,
  updateAssignmentStatus,
  getMyAssignments,
  getMyAssignmentsByStatus,
  getMyAssignmentStatistics,
  type AssignReviewerDTO,
  type AutoAssignReviewerDTO,
  type AvailableReviewerDTO,
  type BulkAssignReviewerDTO,
  type IdLike,
  type RecommendationQuery,
  type RecommendedReviewerDTO,
  type ReviewerAssignmentResponseDTO,
  type MyAssignmentStatisticsDTO,
  AssignmentStatus,
} from "@/services/reviewerAssignmentService";
import { startReview } from "@/services/reviewService";

export function useAvailableReviewers(submissionId?: IdLike) {
  return useQuery<AvailableReviewerDTO[], Error>({
    queryKey: ["availableReviewers", submissionId],
    queryFn: () => getAvailableReviewers(submissionId!),
    enabled: !!submissionId,
  });
}

export function useAssignmentsBySubmission(submissionId?: IdLike) {
  return useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignmentsBySubmission", submissionId],
    queryFn: () => getAssignmentsBySubmission(submissionId!),
    enabled: !!submissionId,
  });
}

export function useAssignmentsByReviewer(reviewerId?: IdLike) {
  return useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignmentsByReviewer", reviewerId],
    queryFn: () => getAssignmentsByReviewer(reviewerId!),
    enabled: !!reviewerId,
  });
}

export function useRecommendedReviewers(
  submissionId?: IdLike,
  query?: RecommendationQuery,
) {
  return useQuery<RecommendedReviewerDTO[], Error>({
    queryKey: ["recommendedReviewers", submissionId, query],
    queryFn: () => getRecommendedReviewers(submissionId!, query),
    enabled: !!submissionId,
  });
}

export const useMyAssignments = (status?: AssignmentStatus) =>
  useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["myAssignments", status ?? "all"],
    queryFn: () =>
      status == null ? getMyAssignments() : getMyAssignmentsByStatus(status),
  });

export const useMyAssignmentStats = () =>
  useQuery<MyAssignmentStatisticsDTO, Error>({
    queryKey: ["myAssignmentsStats"],
    queryFn: () => getMyAssignmentStatistics(),
  });

export function useAssignReviewer() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO, Error, AssignReviewerDTO>({
    mutationFn: assignReviewer,
    onSuccess: (_data, vars) => {
      const key = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", key] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", key] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers", key] });
      qc.invalidateQueries({ queryKey: ["myAssignments"] });
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
    mutationFn: bulkAssignReviewers,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers"] });
      qc.invalidateQueries({ queryKey: ["myAssignments"] });
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
      qc.invalidateQueries({ queryKey: ["myAssignments"] });
    },
  });
}

export function useCancelAssignment() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: cancelAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
      qc.invalidateQueries({ queryKey: ["myAssignments"] });
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
    mutationFn: autoAssignReviewers,
    onSuccess: (_data, vars) => {
      const key = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", key] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", key] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers", key] });
      qc.invalidateQueries({ queryKey: ["myAssignments"] });
    },
  });
}

export function useStartReview() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: startReview,
    onSuccess: (_data, assignmentId) => {
      qc.invalidateQueries({ queryKey: ["assignmentsByReviewer"] });
      qc.invalidateQueries({
        queryKey: ["reviewerAssignmentDetail", assignmentId],
      });
    },
  });
}
