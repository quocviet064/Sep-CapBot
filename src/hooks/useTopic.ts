// src/hooks/useTopic.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTopicDetail,
  fetchAllTopics,
  fetchMyTopics,
  updateTopic,
  type UpdateTopicPayload,
  type UpdateTopicResponse,
  type RawMyTopicResponse,
  type TopicDetailResponse,
} from "@/services/topicService";
import { approveTopic } from "@/services/topicApproveService";
import { TopicType } from "@/schemas/topicSchema";

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
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      queryClient.invalidateQueries({ queryKey: ["topicDetail"] });
    },
  });
}

interface PagingData {
  semesterId: string | null;
  categoryId: string | null;
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}
export interface RawTopicResponse {
  paging: PagingData;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: TopicType[];
}

export const useTopics = (
  SemesterId?: string,
  CategoryId?: string,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
) =>
  useQuery<RawTopicResponse, Error>({
    queryKey: [
      "topics",
      SemesterId,
      CategoryId,
      PageNumber,
      PageSize,
      Keyword,
      TotalRecord,
    ],
    queryFn: () =>
      fetchAllTopics(
        SemesterId,
        CategoryId,
        PageNumber,
        PageSize,
        Keyword,
        TotalRecord,
      ),
    staleTime: 1000 * 60 * 5,
  });

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-topics"] });
    },
    onError: (error) => {
      console.error("❌ Lỗi khi cập nhật đề tài:", error.message);
    },
  });
};

export const fetchAllMyTopics = async (
  semesterId: number,
  categoryId: number,
  keyword: string = "",
): Promise<TopicType[]> => {
  const pageSize = 50;
  let allTopics: TopicType[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const response = await fetchMyTopics(
      semesterId,
      categoryId,
      pageNumber,
      pageSize,
      keyword,
    );

    if (response?.listObjects) {
      allTopics = [...allTopics, ...response.listObjects];
    }

    totalPages = response?.totalPages || 1;
    pageNumber++;
  } while (pageNumber <= totalPages);

  return allTopics;
};
