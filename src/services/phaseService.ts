// src/services/phaseService.ts
import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export type PhaseListItem = {
  id: number;
  name: string;
  phaseTypeName: string;
  semesterName: string;
  startDate: string; // ISO
  endDate: string; // ISO
  submissionDeadline: string; // ISO
};

type ApiResponse<T> = {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

export type PhasePaging = {
  semesterId: number | null;
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
};

export type RawPhaseListResponse = {
  paging: PhasePaging;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: PhaseListItem[];
};

export const fetchPhases = async (
  SemesterId?: number,
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
): Promise<RawPhaseListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<RawPhaseListResponse>>(
      "/phase/list",
      {
        params: {
          SemesterId,
          PageNumber,
          PageSize,
          Keyword,
          TotalRecord,
        },
      },
    );

    const { success, data, message } = res.data;
    if (!success || !data)
      throw new Error(message || "Không thể tải danh sách giai đoạn");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? (error.response?.data as any)?.message ||
        "Không thể tải danh sách giai đoạn"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
export type PhaseDetail = {
  id: number;
  semesterId: number;
  semesterName: string;
  phaseTypeId: number;
  phaseTypeName: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  submissionDeadline: string; // ISO
};

export const fetchPhaseDetail = async (
  id: string | number,
): Promise<PhaseDetail> => {
  try {
    const res = await capBotAPI.get<ApiResponse<PhaseDetail>>(
      `/phase/detail/${id}`,
    );
    const { success, data, message } = res.data;
    if (!success || !data)
      throw new Error(message || "Không thể tải chi tiết giai đoạn");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? (error.response?.data as any)?.message ||
        (error.response?.status === 404
          ? "Giai đoạn không tồn tại"
          : "Không thể tải chi tiết giai đoạn")
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
export type PhaseUpdateDto = {
  id: number;
  semesterId: number;
  phaseTypeId: number;
  name: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
};

export const updatePhase = async (payload: PhaseUpdateDto): Promise<void> => {
  try {
    const res = await capBotAPI.put<ApiResponse<null>>(
      "/phase/update",
      payload,
    );
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Cập nhật giai đoạn thất bại");
    toast.success(message || "Cập nhật giai đoạn thành công");
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? (error.response?.data as any)?.message ||
        (error.response?.status === 409
          ? "Tên giai đoạn đã tồn tại trong học kỳ này"
          : error.response?.status === 404
            ? "Giai đoạn/Semester/PhaseType không tồn tại"
            : error.response?.status === 403
              ? "Quyền truy cập bị từ chối"
              : error.response?.status === 422
                ? "Dữ liệu không hợp lệ"
                : "Không thể cập nhật giai đoạn")
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export type PhaseCreateDto = {
  semesterId: number;
  phaseTypeId: number;
  name: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
};

export const createPhase = async (payload: PhaseCreateDto): Promise<void> => {
  try {
    const res = await capBotAPI.post<ApiResponse<any>>(
      "/phase/create",
      payload,
    );
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Tạo giai đoạn thất bại");
    toast.success(message || "Tạo giai đoạn thành công");
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? (error.response?.data as any)?.message ||
        (error.response?.status === 409
          ? "Tên giai đoạn đã tồn tại trong học kỳ này"
          : error.response?.status === 404
            ? "Semester hoặc PhaseType không tồn tại"
            : error.response?.status === 403
              ? "Quyền truy cập bị từ chối"
              : error.response?.status === 422
                ? "Dữ liệu không hợp lệ"
                : "Không thể tạo giai đoạn")
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
