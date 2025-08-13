import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

interface ApiResponse<T> {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export interface SubmissionPagingDTO {
  topicVersionId: number | null;
  phaseId: number | null;
  semesterId: number | null;
  status: string | null;
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}

export interface SubmissionType {
  id: number;
  topicVersionId: number;
  topicId?: number;
  topicTitle?: string;
  phaseId?: number;
  phaseName?: string;
  semesterId?: number;
  semesterName?: string;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
}

export interface RawSubmissionResponse {
  paging: SubmissionPagingDTO;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: SubmissionType[];
}

export const fetchSubmissions = async (
  TopicVersionId?: number,
  PhaseId?: number,
  SemesterId?: number,
  Status?: string,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
): Promise<RawSubmissionResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<RawSubmissionResponse>>(
      "/submission/list",
      {
        params: {
          TopicVersionId,
          PhaseId,
          SemesterId,
          Status,
          PageNumber,
          PageSize,
          Keyword,
          TotalRecord,
        },
      },
    );

    const { success, data, message } = res.data;
    if (!success)
      throw new Error(message || "Không thể tải danh sách submission");

    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể tải danh sách submission"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchAllSubmissions = async (params: {
  TopicVersionId?: number;
  PhaseId?: number;
  SemesterId?: number;
  Status?: string;
  Keyword?: string;
}): Promise<SubmissionType[]> => {
  const pageSize = 50;
  let pageNumber = 1;
  let totalPages = 1;
  const out: SubmissionType[] = [];

  do {
    const data = await fetchSubmissions(
      params.TopicVersionId,
      params.PhaseId,
      params.SemesterId,
      params.Status,
      pageNumber,
      pageSize,
      params.Keyword,
    );
    if (Array.isArray(data?.listObjects)) {
      out.push(...data.listObjects);
    }
    totalPages = data?.totalPages || 1;
    pageNumber++;
  } while (pageNumber <= totalPages);

  return out;
};
