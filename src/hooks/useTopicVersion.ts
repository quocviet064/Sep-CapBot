import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTopicVersion,
  updateTopicVersion,
  fetchTopicVersionHistory,
  getTopicVersionDetail,
  deleteTopicVersion,
  CreateTopicVersionPayload,
  UpdateTopicVersionPayload,
  TopicVersionDetail,
  TopicVersionHistoryResponse,
  fetchAllTopicVersionsFlat,
  isApprovedVersionStatus,
  TopicVersionHistoryItem,
} from "@/services/topicVersionService";

export const useCreateTopicVersion = () => {
  const queryClient = useQueryClient();

  return useMutation<TopicVersionDetail, Error, CreateTopicVersionPayload>({
    mutationFn: createTopicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-version-history"] });
      queryClient.invalidateQueries({
        queryKey: ["topic-version-history-approved"],
      });
    },
  });
};

export const useUpdateTopicVersion = () => {
  const queryClient = useQueryClient();

  return useMutation<TopicVersionDetail, Error, UpdateTopicVersionPayload>({
    mutationFn: updateTopicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-version-history"] });
      queryClient.invalidateQueries({
        queryKey: ["topic-version-history-approved"],
      });
      queryClient.invalidateQueries({ queryKey: ["topic-version-detail"] });
    },
  });
};

export const useTopicVersionHistory = (
  topicId: number,
  pageNumber: number,
  pageSize: number,
  keyword?: string,
) => {
  return useQuery<TopicVersionHistoryResponse, Error>({
    queryKey: ["topic-version-history", topicId, pageNumber, pageSize, keyword],
    queryFn: () =>
      fetchTopicVersionHistory(topicId, pageNumber, pageSize, keyword),
    enabled: !!topicId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopicVersionDetail = (versionId?: number) => {
  return useQuery<TopicVersionDetail, Error>({
    queryKey: ["topic-version-detail", versionId],
    queryFn: () => getTopicVersionDetail(Number(versionId)),
    enabled: !!versionId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeleteTopicVersion = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: deleteTopicVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic-version-history"] });
      queryClient.invalidateQueries({
        queryKey: ["topic-version-history-approved"],
      });
    },
  });
};

export const useApprovedTopicVersions = (
  topicId?: number,
  keyword?: string,
) => {
  return useQuery<TopicVersionHistoryItem[], Error>({
    queryKey: ["topic-version-history-approved", topicId, keyword],
    enabled: !!topicId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const all = await fetchAllTopicVersionsFlat(Number(topicId), keyword);
      return all.filter((v) => isApprovedVersionStatus(v.status));
    },
  });
};
