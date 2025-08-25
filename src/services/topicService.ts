import capBotAPI from "@/lib/CapBotApi";
import { toast } from "sonner";
import axios from "axios";
import { TopicType } from "@/schemas/topicSchema";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
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

export interface CreateTopicPayload {
  title: string;
  description: string;
  objectives: string;
  categoryId: number;
  semesterId: number;
  maxStudents: number;
  methodology?: string;
  expectedOutcomes?: string;
  requirements?: string;
  documentUrl?: string;
}

export interface TopicDetailResponse {
  id: number;
  title: string;
  description: string;
  objectives: string;
  supervisorId: number;
  supervisorName: string;
  categoryId: number;
  categoryName: string;
  semesterId: number;
  semesterName: string;
  maxStudents: number;
  isApproved: boolean | null;
  isLegacy: boolean;
  currentStatus: number;
  totalVersions: number;
  currentVersion: {
    id: number;
    topicId: number;
    versionNumber: number;
    title: string;
    description: string;
    objectives: string;
    methodology: string;
    expectedOutcomes: string;
    requirements: string;
    documentUrl: string;
    status: number;
    submittedAt: string | null;
    submittedByUserName: string | null;
    createdAt: string;
    createdBy: string;
    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
  } | null;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export const createTopic = async (
  payload: CreateTopicPayload,
): Promise<TopicDetailResponse> => {
  try {
    const response = await capBotAPI.post<ApiResponse<TopicDetailResponse>>(
      "/topic/create",
      payload,
    );
    const { success, message, data } = response.data;
    if (!success) throw new Error(message || "Tạo chủ đề thất bại");
    toast.success("🎉 Tạo chủ đề thành công!");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Tạo chủ đề thất bại"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchAllTopics = async (
  SemesterId?: string,
  CategoryId?: string,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
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
    if (!success) throw new Error(message || "Không thể tải danh sách đề tài");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể tải danh sách đề tài"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getTopicDetail = async (
  topicId: number,
): Promise<TopicDetailResponse> => {
  try {
    const response = await capBotAPI.get<ApiResponse<TopicDetailResponse>>(
      `/topic/detail/${topicId}`,
    );
    const { success, data, message } = response.data;
    if (!success) throw new Error(message || "Không thể lấy chi tiết đề tài");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy chi tiết đề tài"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export interface UpdateTopicPayload {
  id: number;
  title: string;
  description: string;
  objectives: string;
  categoryId: number;
  maxStudents: number;
  semesterId: number;
}

export interface UpdateTopicResponse {
  id: number;
  title: string;
  description: string;
  supervisorName: string;
  categoryName: string;
  semesterName: string;
  maxStudents: number;
  isApproved: boolean | null;
  updatedAt: string;
  updatedBy: string;
  currentVersionNumber: number;
}

export const updateTopic = async (
  payload: UpdateTopicPayload,
): Promise<UpdateTopicResponse> => {
  try {
    const response = await capBotAPI.put<ApiResponse<UpdateTopicResponse>>(
      "/topic/update",
      payload,
    );
    const { success, message, data } = response.data;
    if (!success) throw new Error(message || "Cập nhật đề tài thất bại");
    toast.success("🎉 Cập nhật đề tài thành công!");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : "Cập nhật đề tài thất bại")
      : "Đã xảy ra lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export interface RawMyTopicResponse {
  paging: PagingData;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: TopicType[];
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
    if (!success)
      throw new Error(message || "Không thể lấy danh sách đề tài của bạn");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy danh sách đề tài"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
