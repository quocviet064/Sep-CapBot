import { useQuery } from "@tanstack/react-query";
import { fetchMyTopics } from "@/services/myTopicService";
import { RawMyTopicResponse } from "@/services/myTopicService";

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
