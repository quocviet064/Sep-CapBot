import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateEvaluationCriteriaDTO,
  EvaluationCriteriaDTO,
  UpdateEvaluationCriteriaDTO,
  IdLike,
} from "@/services/evaluationCriteriaService";
import {
  createEvaluationCriteria,
  deleteEvaluationCriteria,
  getActiveEvaluationCriteria,
  getEvaluationCriteriaById,
  updateEvaluationCriteria,
} from "@/services/evaluationCriteriaService";

const keys = {
  root: ["evaluation-criteria"] as const,
  active: ["evaluation-criteria", "active"] as const,
  detail: (id: IdLike) =>
    ["evaluation-criteria", "detail", String(id)] as const,
};

export function useActiveEvaluationCriteria() {
  return useQuery<EvaluationCriteriaDTO[], Error>({
    queryKey: keys.active,
    queryFn: getActiveEvaluationCriteria,
  });
}

export function useEvaluationCriteria(id?: IdLike) {
  return useQuery<EvaluationCriteriaDTO, Error>({
    queryKey: id ? keys.detail(id) : [...keys.root, "detail", "undefined"],
    queryFn: () => getEvaluationCriteriaById(id as IdLike),
    enabled: id !== undefined && id !== null && String(id).length > 0,
  });
}

export function useCreateEvaluationCriteria() {
  const qc = useQueryClient();
  return useMutation<EvaluationCriteriaDTO, Error, CreateEvaluationCriteriaDTO>(
    {
      mutationFn: createEvaluationCriteria,
      onSuccess: (data) => {
        toast.success("Tạo tiêu chí đánh giá thành công");
        qc.invalidateQueries({ queryKey: keys.active });
        qc.setQueryData(keys.detail(data.id), data);
      },
      onError: (err) => {
        toast.error(err.message || "Tạo tiêu chí đánh giá thất bại");
      },
    },
  );
}

export function useUpdateEvaluationCriteria() {
  const qc = useQueryClient();
  return useMutation<EvaluationCriteriaDTO, Error, UpdateEvaluationCriteriaDTO>(
    {
      mutationFn: updateEvaluationCriteria,
      onSuccess: (data) => {
        toast.success("Cập nhật tiêu chí đánh giá thành công");
        qc.invalidateQueries({ queryKey: keys.active });
        qc.setQueryData(keys.detail(data.id), data);
      },
      onError: (err) => {
        toast.error(err.message || "Cập nhật tiêu chí đánh giá thất bại");
      },
    },
  );
}

export function useDeleteEvaluationCriteria() {
  const qc = useQueryClient();
  return useMutation<void, Error, IdLike>({
    mutationFn: deleteEvaluationCriteria,
    onSuccess: () => {
      toast.success("Xóa tiêu chí đánh giá thành công");
      qc.invalidateQueries({ queryKey: keys.active });
    },
    onError: (err) => {
      toast.error(err.message || "Xóa tiêu chí đánh giá thất bại");
    },
  });
}
