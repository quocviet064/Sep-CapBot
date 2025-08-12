import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignReviewer,
  bulkAssignReviewers,
  getAvailableReviewers,
  getAssignmentsBySubmission,
  updateAssignmentStatus,
  cancelAssignment,
  autoAssignReviewers,
  AvailableReviewerDTO,
  ReviewerAssignmentResponseDTO,
  AssignReviewerDTO,
  BulkAssignReviewerDTO,
  AssignmentStatus,
  AutoAssignReviewerDTO,
  getRecommendedReviewers,
  RecommendedReviewerDTO,
  RecommendationQuery,
} from "@/services/reviewerAssignmentService";

// Query lấy reviewers có thể phân công theo submission
export function useAvailableReviewers(submissionId?: string) {
  return useQuery<AvailableReviewerDTO[], Error>({
    queryKey: ["availableReviewers", submissionId ?? ""],
    queryFn: () => getAvailableReviewers(Number(submissionId)),
    enabled: Boolean(submissionId),
  });
}

// Query lấy assignments hiện tại của một submission
export function useAssignmentsBySubmission(submissionId?: string) {
  return useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignmentsBySubmission", submissionId ?? ""],
    queryFn: () => getAssignmentsBySubmission(Number(submissionId)),
    enabled: Boolean(submissionId),
  });
}

// Phân công một reviewer
export function useAssignReviewer() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO, Error, AssignReviewerDTO>({
    mutationFn: (payload) => assignReviewer(payload),
    onSuccess: (_data, vars) => {
      const sid = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", sid] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
    },
  });
}

// Phân công hàng loạt (payload.assignments có thể chứa nhiều submissionId)
export function useBulkAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO[], Error, BulkAssignReviewerDTO>({
    mutationFn: (payload) => bulkAssignReviewers(payload),
    onSuccess: (_data, vars) => {
      // Lấy tất cả submissionId trong mảng assignments để invalidate đúng cache
      const sids = Array.from(
        new Set(vars.assignments.map((a) => String(a.submissionId)))
      );
      sids.forEach((sid) => {
        qc.invalidateQueries({ queryKey: ["availableReviewers", sid] });
        qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
      });
    },
  });
}

// Cập nhật trạng thái một assignment
export function useUpdateAssignmentStatus() {
  const qc = useQueryClient();
  return useMutation<void, Error, { assignmentId: number; status: AssignmentStatus }>({
    mutationFn: ({ assignmentId, status }) => updateAssignmentStatus(assignmentId, status),
    onSuccess: () => {
      // Không biết sid cụ thể => invalidate theo prefix (refetch tất cả list theo submission)
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

// Hủy một assignment
export function useCancelAssignment() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (assignmentId) => cancelAssignment(assignmentId),
    onSuccess: () => {
      // Không biết sid cụ thể => invalidate theo prefix
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

// Tự động phân công reviewers
export function useAutoAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO[], Error, AutoAssignReviewerDTO>({
    mutationFn: (payload) => autoAssignReviewers(payload),
    onSuccess: (_data, vars) => {
      const sid = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", sid] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", sid] });
    },
  });
}

// Query lấy danh sách reviewers được gợi ý cho một submission
export function useRecommendedReviewers(
  submissionId?: string,
  query?: RecommendationQuery
) {
  const key = ["recommendedReviewers", submissionId ?? "", JSON.stringify(query ?? {})];
  return useQuery<RecommendedReviewerDTO[], Error>({
    queryKey: key,
    queryFn: () => getRecommendedReviewers(Number(submissionId), query),
    enabled: Boolean(submissionId),
  });
}
