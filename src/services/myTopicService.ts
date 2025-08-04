import capBotAPI from "@/lib/CapBotApi";
import { TopicType } from "@/schemas/topicSchema";
import axios from "axios";
import { toast } from "sonner";

interface PagingData {
  semesterId: number | null;
  categoryId: number | null;
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}

export interface RawMyTopicResponse {
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
  errors: unknown;
  message: string | null;
}

export const fetchMyTopics = async (
  SemesterId?: number,
  CategoryId?: number,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
): Promise<RawMyTopicResponse> => {
  try {
    const response = await capBotAPI.get<ApiResponse<RawMyTopicResponse>>(
      `/topic/my-topics`,
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
      throw new Error(message || "Không thể lấy danh sách đề tài của bạn");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Không thể lấy danh sách đề tài";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.error("Lỗi không xác định");
    throw new Error("Lỗi không xác định");
  }
};
