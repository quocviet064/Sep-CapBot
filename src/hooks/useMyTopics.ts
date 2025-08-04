import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyTopics } from "@/services/myTopicService";
import { RawMyTopicResponse } from "@/services/myTopicService";
import {
  updateTopic,
  UpdateTopicPayload,
  UpdateTopicResponse,
} from "@/services/topicUpdateService";

export const useMyTopics = (
  SemesterId?: number,
  CategoryId?: number,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
) =>
  useQuery<RawMyTopicResponse, Error>({
    queryKey: [
      "my-topics",
      SemesterId,
      CategoryId,
      PageNumber,
      PageSize,
      Keyword,
      TotalRecord,
    ],
    queryFn: () =>
      fetchMyTopics(
        SemesterId,
        CategoryId,
        PageNumber,
        PageSize,
        Keyword,
        TotalRecord,
      ),
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateTopicResponse, Error, UpdateTopicPayload>({
    mutationFn: updateTopic,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-topics"] });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật đề tài:", error.message);
    },
  });
};
