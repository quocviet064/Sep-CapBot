import capBotAPI from "@/lib/CapBotApi";
import { toast } from "sonner";
import axios from "axios";

interface ApiResponse<T> {
  statusCode: string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export interface CreateTopicVersionPayload {
  topicId: number;
  title: string;
  description: string;
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  requirements: string;
  documentUrl: string;
}

export interface TopicVersionDetail {
  id: number;
  topicId: number;
  versionNumber: number;
  title: string;
  problem: string;
  eN_Title: string;
  vN_title: string;
  context: string;
  content: string;
  description: string;
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  requirements: string;
  documentUrl: string;
  status: string | number;
  submittedAt: string | null;
  submittedByUserName: string | null;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export interface UpdateTopicVersionPayload {
  id: number;
  description: string;
  objectives: string;
  methodology: string;
  expectedOutcomes: string;
  requirements: string;
  documentUrl: string;
  eN_Title: string;
  vN_title: string;
  problem: string;
  context: string;
  content: string;
  status: string | number;
}

export interface PagingData {
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}

export interface TopicVersionHistoryItem {
  id: number;
  topicId: number;
  versionNumber: number;
  title: string;
  documentUrl: string;
  status: string | number;
  submittedAt: string | null;
  submittedByUserName: string | null;
  createdAt: string;
  createdBy: string;
}

export interface TopicVersionHistoryResponse {
  paging: PagingData;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: TopicVersionHistoryItem[];
}

export const createTopicVersion = async (
  payload: CreateTopicVersionPayload,
): Promise<TopicVersionDetail> => {
  const response = await capBotAPI.post<ApiResponse<TopicVersionDetail>>(
    "/topic-version/create",
    payload,
  );
  const { success, data, message } = response.data;
  if (!success) throw new Error(message || "Tạo phiên bản chủ đề thất bại");
  return data;
};

export const updateTopicVersion = async (
  payload: UpdateTopicVersionPayload,
): Promise<TopicVersionDetail> => {
  try {
    const response = await capBotAPI.put<ApiResponse<TopicVersionDetail>>(
      "/topic-version/update",
      payload,
    );
    const { success, data, message } = response.data;
    if (!success) throw new Error(message || "Cập nhật phiên bản thất bại");

    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Cập nhật phiên bản thất bại"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchTopicVersionHistory = async (
  topicId: number,
  pageNumber: number,
  pageSize: number,
  keyword?: string,
): Promise<TopicVersionHistoryResponse> => {
  try {
    const response = await capBotAPI.get<
      ApiResponse<TopicVersionHistoryResponse>
    >(`/topic-version/history/${topicId}`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        Keyword: keyword,
      },
    });
    const { success, data, message } = response.data;
    if (!success) throw new Error(message || "Không thể lấy lịch sử phiên bản");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy lịch sử phiên bản"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getTopicVersionDetail = async (
  versionId: number,
): Promise<TopicVersionDetail> => {
  try {
    const response = await capBotAPI.get<ApiResponse<TopicVersionDetail>>(
      `/topic-version/detail/${versionId}`,
    );
    const { success, data, message } = response.data;
    if (!success)
      throw new Error(message || "Không thể lấy chi tiết phiên bản");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy chi tiết phiên bản"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const deleteTopicVersion = async (versionId: number): Promise<void> => {
  try {
    const response = await capBotAPI.delete<ApiResponse<null>>(
      `/topic-version/delete/${versionId}`,
    );
    const { success, message } = response.data;
    if (!success) throw new Error(message || "Xóa phiên bản thất bại");
    toast.success("🗑️ Xóa phiên bản thành công!");
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Xóa phiên bản thất bại"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const isApprovedVersionStatus = (s: unknown) => {
  if (s === 5) return true;
  const v = (s ?? "").toString().toLowerCase();
  return v === "approved";
};

export const fetchAllTopicVersionsFlat = async (
  topicId: number,
  keyword?: string,
): Promise<TopicVersionHistoryItem[]> => {
  const pageSize = 100;
  let pageNumber = 1;
  let hasNext = true;
  const all: TopicVersionHistoryItem[] = [];

  while (hasNext) {
    const res = await fetchTopicVersionHistory(
      topicId,
      pageNumber,
      pageSize,
      keyword,
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
