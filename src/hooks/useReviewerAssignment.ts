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
  getAssignmentsByReviewer,
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
import { toast } from "sonner";

type ApiResponse<T> = {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

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

export const useMyAssignments = (status?: AssignmentStatus) =>
  useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["my-assignments", status ?? "all"],
    queryFn: () => (status == null ? getMyAssignments() : getMyAssignmentsByStatus(status)),
    staleTime: 1000 * 60 * 3,
  });

export const useMyAssignmentStats = () =>
  useQuery<MyAssignmentStatisticsDTO, Error>({
    queryKey: ["my-assignments-stats"],
    queryFn: () => getMyAssignmentStatistics(),
    staleTime: 1000 * 60 * 5,
  });

export const useAssignmentsByReviewer = (reviewerId?: IdLike) =>
  useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignments-by-reviewer", reviewerId ?? "me"],
    enabled: !!reviewerId,
    queryFn: () => getAssignmentsByReviewer(reviewerId as IdLike),
    staleTime: 1000 * 60 * 3,
  });

export function useAssignReviewer() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO, Error, AssignReviewerDTO>({
    mutationFn: (payload) => assignReviewer(payload),
    onSuccess: (_data, vars) => {
      const k = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", k] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", k] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers", k] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
  });
}

/** Bulk assign */
export function useBulkAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<ApiResponse<ReviewerAssignmentResponseDTO[]>, Error, BulkAssignReviewerDTO>({
    mutationFn: (payload) => bulkAssignReviewers(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers"] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
    onError: (e) => {
      toast.error(e.message || "Bulk assign thất bại");
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
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
  });
}

export function useCancelAssignment() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: (assignmentId) => cancelAssignment(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
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
      qc.invalidateQueries({ queryKey: ["my-assignments"] });
    },
  });
}

export function useStartReview() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: (assignmentId) => startReview(assignmentId),
    onSuccess: (_data, assignmentId) => {
      qc.invalidateQueries({ queryKey: ["assignments-by-reviewer"] });
      qc.invalidateQueries({ queryKey: ["reviewer-assignment-detail", assignmentId] });
    },
  });
}
