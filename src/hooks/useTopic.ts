import { TopicType } from "@/schemas/topicSchema";
import { fetchAllTopics } from "@/services/topicService";

import { useQuery } from "@tanstack/react-query";

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
  TotalRecord?: number | undefined,
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
