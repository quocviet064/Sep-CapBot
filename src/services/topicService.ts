import capBotAPI from "@/lib/CapBotApi";
import { TopicType } from "@/schemas/topicSchema";
import axios from "axios";
import { toast } from "sonner";

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

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: any;
  message: string | null;
}

export const fetchAllTopics = async (
  SemesterId?: string,
  CategoryId?: string,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number | undefined,
): Promise<RawTopicResponse> => {
  try {
    const response = await capBotAPI.get<ApiResponse<RawTopicResponse>>(
      `/topic/list`,
      {
        params: {
          SemesterId,
          CategoryId,
          PageNumber,
          PageSize,
          Keyword,
          TotalRecord,
        },
      },
    );

    const { success, message, data } = response.data;

    if (!success) {
      throw new Error(message || "Failed to fetch topic");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch topic";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};
