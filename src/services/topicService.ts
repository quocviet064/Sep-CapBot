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

interface PagingData {
  semesterId: number | null;
  categoryId: number | null;
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}

export type SubmissionStatus =
  | "Pending"
  | "UnderReview"
  | "Duplicate"
  | "RevisionRequired"
  | "EscalatedToModerator"
  | "Approved"
  | "Rejected";

export interface SubmissionDTO {
  id: number;
  topicId: number;
  topicVersionId: number | null;
  phaseId: number;
  submittedBy: number;
  submissionRound: number;
  documentUrl: string | null;
  additionalNotes: string | null;
  aiCheckStatus: string | null;
  aiCheckScore: number | null;
  aiCheckDetails: string | null;
  status: SubmissionStatus;
  submittedAt: string;
}

export interface TopicVersionDTO {
  id: number;
  versionNumber: number;
  status: string | number;
  submittedAt: string | null;
  submittedByUserName: string | null;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
  fileId?: number | null;
  documentUrl?: string | null;
  title?: string;
  eN_Title?: string;
  vN_title?: string;
  description?: string;
  objectives?: string;
  methodology?: string;
  expectedOutcomes?: string;
  requirements?: string;
  topicId?: number;
  submissions?: SubmissionDTO[];
}

export interface TopicListItem {
  id: number;
  eN_Title: string;
  abbreviation: string;
  vN_title: string;
  problem: string;
  context: string;
  content: string;
  description: string;
  supervisorName: string;
  categoryName: string;
  semesterName: string;
  createdBy: string;
  maxStudents: number;
  latestSubmissionStatus: SubmissionStatus | null;
  isApproved: boolean;
  isLegacy: boolean;
  hasSubmitted: boolean;
  currentStatus: string;
  currentVersionNumber: number;
  createdAt: string;
  latestSubmittedAt: string | null;
}

export interface RawTopicResponse {
  paging: PagingData;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: TopicListItem[];
}

export interface CreateTopicPayload {
  eN_Title: string;
  vN_title: string;
  categoryId: number;
  semesterId: number;
  maxStudents: number;
  abbreviation?: string;
  problem?: string;
  context?: string;
  content?: string;
  description?: string;
  objectives?: string;
  fileId?: number | null;
}

export interface TopicDetailResponse {
  id: number;
  eN_Title: string;
  abbreviation: string;
  vN_title: string;
  problem: string;
  context: string;
  content: string;
  description: string;
  objectives: string;
  supervisorId: number;
  supervisorName: string;
  categoryId: number;
  categoryName: string;
  hasSubmitted: boolean;
  semesterId: number;
  semesterName: string;
  maxStudents: number;
  isApproved: boolean;
  isLegacy: boolean;
  fileId: number | null;
  documentUrl: string | null;
  currentStatus: string;
  totalVersions: number;
  totalSubmissions?: number;
  latestSubmissionStatus?: SubmissionStatus | null;
  latestSubmittedAt?: string | null;
  submissions?: SubmissionDTO[];
  currentVersion: TopicVersionDTO | null;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
  status?: string;                    
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
  SemesterId?: number,
  CategoryId?: number,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
): Promise<RawTopicResponse> => {
  try {
    const response = await capBotAPI.get<ApiResponse<RawTopicResponse>>(
      "/topic/list",
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
  eN_Title?: string;
  abbreviation?: string;
  vN_title?: string;
  problem?: string;
  context?: string;
  content?: string;
  description?: string;
  objectives?: string;
  categoryId?: number;
  maxStudents?: number;
  fileId?: number | null;
}

export const updateTopic = async (
  payload: UpdateTopicPayload,
): Promise<TopicDetailResponse> => {
  try {
    const response = await capBotAPI.put<ApiResponse<TopicDetailResponse>>(
      "/topic/update",
      payload,
    );
    const { success, message, data } = response.data;
    if (!success) throw new Error(message || "Cập nhật đề tài thất bại");
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
  listObjects: TopicListItem[];
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
      "/topic/my-topics",
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

export const deleteTopic = async (topicId: number): Promise<void> => {
  try {
    const response = await capBotAPI.delete<ApiResponse<null>>(
      `/topic/delete/${topicId}`,
    );
    const { success, message } = response.data as ApiResponse<null>;
    if (!success) throw new Error(message || "Xoá đề tài thất bại");
    return;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Xoá đề tài thất bại"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
