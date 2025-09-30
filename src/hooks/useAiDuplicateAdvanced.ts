import { useMutation } from "@tanstack/react-query";
import {
  checkDuplicateAdvanced,
  getTopicSuggestionsV2,
  type AdvancedDuplicateParams,
  type AdvancedDuplicatePayload,
  type AdvancedDuplicateResponse,
  type TopicSuggestionsV2Params,
  type TopicSuggestionsV2Response,
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

export function useTopicSuggestionsV2() {
  return useMutation<
    TopicSuggestionsV2Response,
    unknown,
    TopicSuggestionsV2Params
  >({
    mutationFn: (params) => getTopicSuggestionsV2(params),
  });
}
