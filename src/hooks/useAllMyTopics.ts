import { fetchMyTopics } from "@/services/myTopicService";
import { TopicType } from "@/schemas/topicSchema";

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
