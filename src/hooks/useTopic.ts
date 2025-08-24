import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTopicDetail,
  fetchAllTopics,
  fetchMyTopics,
  updateTopic,
  createTopic,
  type UpdateTopicPayload,
  type UpdateTopicResponse,
  type RawMyTopicResponse,
  type TopicDetailResponse,
  type CreateTopicPayload,
  type RawTopicResponse,
} from "@/services/topicService";
import { approveTopic } from "@/services/topicApproveService";
import type { TopicType } from "@/schemas/topicSchema";
import { toast } from "sonner";

export const useCreateTopic = () => {
  const qc = useQueryClient();
  return useMutation<TopicDetailResponse, Error, CreateTopicPayload>({
    mutationFn: createTopic,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["my-topics"] });
      qc.setQueryData(["topicDetail", String(data.id)], data);
    },
  });
};

export function useTopicDetail(topicId?: string) {
  return useQuery<TopicDetailResponse, Error>({
    queryKey: ["topicDetail", topicId],
    queryFn: () => getTopicDetail(Number(topicId)),
    enabled: !!topicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useApproveTopic() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (topicId) => approveTopic(topicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["topicDetail"] });
    },
  });
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
  const qc = useQueryClient();
  return useMutation<UpdateTopicResponse, Error, UpdateTopicPayload>({
    mutationFn: updateTopic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-topics"] });
    },
    onError: (e) => {
      toast.error(e.message || "Cập nhật đề tài thất bại");
    },
  });
};

export const fetchAllMyTopics = async (
  semesterId?: number,
  categoryId?: number,
  keyword?: string,
): Promise<TopicType[]> => {
  const pageSize = 100;
  let pageNumber = 1;
  let hasNext = true;
  const all: TopicType[] = [];
  const kw = keyword && keyword.trim() ? keyword.trim() : undefined;

  while (hasNext) {
    const res = await fetchMyTopics(
      semesterId,
      categoryId,
      pageNumber,
      pageSize,
      kw,
    );
    if (Array.isArray(res?.listObjects) && res.listObjects.length) {
      all.push(...res.listObjects);
    }
    hasNext = Boolean(res?.hasNextPage);
    pageNumber += 1;
    if (!res?.totalPages && !hasNext) break;
  }
  return all;
};
