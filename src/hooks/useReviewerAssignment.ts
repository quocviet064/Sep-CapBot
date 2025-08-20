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
  getAssignmentsByReviewer, // ✅ THÊM
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

/* ===== Queries ===== */

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

/* ===== Mutations ===== */

export function useAssignReviewer() {
  const qc = useQueryClient();
  return useMutation<ReviewerAssignmentResponseDTO, Error, AssignReviewerDTO>({
    mutationFn: (payload) => assignReviewer(payload),
    onSuccess: (_data, vars) => {
      const k = String(vars.submissionId);
      qc.invalidateQueries({ queryKey: ["availableReviewers", k] });
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission", k] });
      qc.invalidateQueries({ queryKey: ["recommendedReviewers", k] });
      qc.invalidateQueries({ queryKey: ["assignments-by-reviewer"] }); // ✅ thêm
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
      qc.invalidateQueries({ queryKey: ["assignments-by-reviewer"] }); // ✅ thêm
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
      qc.invalidateQueries({ queryKey: ["assignments-by-reviewer"] }); // ✅ thêm
    },
  });
}

export function useCancelAssignment() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: (assignmentId) => cancelAssignment(assignmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignmentsBySubmission"] });
      qc.invalidateQueries({ queryKey: ["assignments-by-reviewer"] }); // ✅ thêm
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
      qc.invalidateQueries({ queryKey: ["assignments-by-reviewer"] }); // ✅ thêm
    },
  });
}

/** Giải mã JWT và lấy user id */
function getCurrentUserIdFromJWT(): number | undefined {
  try {
    const token =
      localStorage.getItem("accessToken")
    if (!token) return undefined;
    const base64Url = token.split(".")[1];
    if (!base64Url) return undefined;
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const payload = JSON.parse(atob(base64));
    const raw =
      payload?.id ??
      payload?.nameid ??
      payload?.nameidentifier ??
      payload?.sub;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

/** assignments theo reviewer */
export const useAssignmentsByReviewer = (reviewerId?: IdLike) => {
  const derivedId = reviewerId ?? getCurrentUserIdFromJWT();
  return useQuery<ReviewerAssignmentResponseDTO[], Error>({
    queryKey: ["assignments-by-reviewer", derivedId ?? "me"],
    enabled: !!derivedId,
    queryFn: () => getAssignmentsByReviewer(derivedId as IdLike),
    staleTime: 1000 * 60 * 3,
  });
};
