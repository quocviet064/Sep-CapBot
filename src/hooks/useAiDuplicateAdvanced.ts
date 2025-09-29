import { useMutation } from "@tanstack/react-query";
import {
  checkDuplicateAdvanced,
  type AdvancedDuplicateParams,
  type AdvancedDuplicatePayload,
  type AdvancedDuplicateResponse,
} from "@/services/aiDuplicateAdvancedService";

export function useCheckDuplicateAdvanced() {
  return useMutation<
    AdvancedDuplicateResponse,
    unknown,
    { body: AdvancedDuplicatePayload; params?: AdvancedDuplicateParams }
  >({
    mutationFn: ({ body, params }) => checkDuplicateAdvanced(body, params),
  });
}
