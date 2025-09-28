import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCriteria,
  createCriteria,
  updateCriteria,
  getCriteriaForCurrentSemester,
  type GetCriteriaQuery,
  type CriteriaPagedResponse,
  type EvaluationCriteriaDTO,
  type CreateCriteriaPayload,
  type UpdateCriteriaPayload,
  getCriteriaDetail,
} from "@/services/evaluationCriteriaService";
import { toast } from "sonner";

export function useCriteria(args: GetCriteriaQuery) {
  return useQuery<CriteriaPagedResponse, Error>({
    queryKey: [
      "criteria",
      args.PageNumber ?? 1,
      args.PageSize ?? 10,
      args.Keyword ?? null,
      args.TotalRecord ?? null,
    ] as const,
    queryFn: () => fetchCriteria(args),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCriteria() {
  const qc = useQueryClient();
  return useMutation<EvaluationCriteriaDTO, Error, CreateCriteriaPayload>({
    mutationFn: createCriteria,
    onSuccess: () => {
      toast.success("Tạo tiêu chí thành công");
      qc.invalidateQueries({ queryKey: ["criteria"] });
    },
    onError: (e) => {
      toast.error(e.message || "Tạo tiêu chí thất bại");
    },
  });
}

export function useUpdateCriteria() {
  const qc = useQueryClient();
  return useMutation<EvaluationCriteriaDTO, Error, UpdateCriteriaPayload>({
    mutationFn: updateCriteria,
    onSuccess: () => {
      toast.success("Cập nhật tiêu chí thành công");
      qc.invalidateQueries({ queryKey: ["criteria"] });
    },
    onError: (e) => {
      toast.error(e.message || "Cập nhật tiêu chí thất bại");
    },
  });
}
export const useCriteriaDetail = (id?: number | string) =>
  useQuery<EvaluationCriteriaDTO, Error>({
    queryKey: ["criteria-detail", String(id ?? "")],
    queryFn: () => getCriteriaDetail(Number(id)),
    enabled: id !== undefined && id !== null && String(id).length > 0,
    staleTime: 1000 * 60 * 5,
  });

export function useCurrentSemesterCriteria() {
  return useQuery<EvaluationCriteriaDTO[], Error>({
    queryKey: ["criteria-current-semester"],
    queryFn: () => getCriteriaForCurrentSemester(),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
}