import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTopicDetail,
  TopicDetailResponse,
} from "@/services/topicDetailService";
import { approveTopic } from "@/services/topicApproveService";

export function useTopicDetail(topicId?: string) {
  return useQuery<TopicDetailResponse, Error>({
    queryKey: ["topicDetail", topicId],
    queryFn: () => getTopicDetail(Number(topicId)),
    enabled: !!topicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useApproveTopic() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (topicId) => approveTopic(topicId),
    onSuccess: () => {
      // refetch lại list và detail sau khi approve
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["topicDetail"] });
    },
  });
}
