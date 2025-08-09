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
} from "@/services/reviewerAssignmentService";

// Query lấy reviewers có thể pahan công 
export function useAvailableReviewers(submissionId?: string) {
  return useQuery<AvailableReviewerDTO[], Error>({
    queryKey: ["availableReviewers", submissionId],
    queryFn: () => getAvailableReviewers(Number(submissionId)),
    enabled: Boolean(submissionId),
  });
}

// Query lấy assignments hiện tại của một submission
export function useAssignmentsBySubmission(submissionId?: string) {
  return useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignmentsBySubmission", submissionId],
    queryFn: () => getAssignmentsBySubmission(Number(submissionId)),
    enabled: Boolean(submissionId),
  });
}

// phân công một reviewer
export function useAssignReviewer() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO, Error, AssignReviewerDTO>({
    mutationFn: (payload) => assignReviewer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

// phân công hàng loạt
export function useBulkAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO[], Error, BulkAssignReviewerDTO>({
    mutationFn: (payload) => bulkAssignReviewers(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

// cập nhật trạng thái một assignment
export function useUpdateAssignmentStatus() {
  const qc = useQueryClient();
  return useMutation<void, Error, { assignmentId: number; status: AssignmentStatus }>({
    mutationFn: ({ assignmentId, status }) => updateAssignmentStatus(assignmentId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

// hủy một assignment
export function useCancelAssignment() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (assignmentId) => cancelAssignment(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}

// tự động phân công reviewers
export function useAutoAssignReviewers() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO[], Error, AutoAssignReviewerDTO>({
    mutationFn: (payload) => autoAssignReviewers(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availableReviewers"] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
    },
  });
}
