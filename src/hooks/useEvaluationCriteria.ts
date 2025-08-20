import { useQuery } from "@tanstack/react-query";
import {
  getActiveEvaluationCriteria,
  type EvaluationCriteriaDTO,
} from "@/services/evaluationCriteriaService";

/** Lấy tất cả tiêu chí đang active */
export const useActiveEvaluationCriteria = (enabled: boolean = true) =>
  useQuery<EvaluationCriteriaDTO[], Error>({
    queryKey: ["evaluation-criteria", "active"],
    queryFn: getActiveEvaluationCriteria,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
