import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";
import type { PhaseType } from "@/schemas/phaseTypeSchema";

interface ApiResponse<T> {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

interface PagingData {
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}

export interface RawPhaseTypeResponse {
  paging: PagingData;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: PhaseType[];
}

export interface PhaseTypeDetail {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export const fetchPhaseTypes = async (
  PageNumber?: number,
  PageSize?: number,
  Keyword?: string,
  TotalRecord?: number,
): Promise<RawPhaseTypeResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<RawPhaseTypeResponse>>(
      "/phase-type/all-paging",
      {
        params: { PageNumber, PageSize, Keyword, TotalRecord },
      },
    );

    const { success, data, message } = res.data;
    if (!success) throw new Error(message || "Không thể tải loại giai đoạn");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể tải loại giai đoạn"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchAllPhaseTypes = async (
  keyword: string = "",
): Promise<PhaseType[]> => {
  const pageSize = 50;
  let pageNumber = 1;
  let totalPages = 1;
  const all: PhaseType[] = [];

  do {
    const page = await fetchPhaseTypes(pageNumber, pageSize, keyword);
    if (Array.isArray(page?.listObjects)) {
      all.push(...page.listObjects);
    }
    totalPages = page?.totalPages || 1;
    pageNumber++;
  } while (pageNumber <= totalPages);

  return all;
};

export const fetchPhaseTypeDetail = async (
  phaseTypeId: string | number,
): Promise<PhaseTypeDetail> => {
  try {
    const res = await capBotAPI.get<ApiResponse<PhaseTypeDetail>>(
      `/phase-type/detail/${phaseTypeId}`,
    );
    const { success, data, message } = res.data;
    if (!success || !data) {
      throw new Error(message || "Không thể tải chi tiết loại giai đoạn");
    }
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể tải chi tiết loại giai đoạn"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
export type PhaseTypeUpdateDto = {
  id: number;
  name: string;
  description: string | null;
};

export const updatePhaseType = async (
  payload: PhaseTypeUpdateDto,
): Promise<PhaseTypeDetail | null> => {
  try {
    const res = await capBotAPI.put<ApiResponse<PhaseTypeDetail | null>>(
      "/phase-type/update",
      payload,
    );

    const { success, data, message } = res.data;
    if (!success) {
      throw new Error(message || "Cập nhật loại giai đoạn thất bại");
    }

    toast.success(message || "Cập nhật loại giai đoạn thành công");
    return data ?? null;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        (error.response?.status === 409
          ? "Tên loại giai đoạn đã tồn tại"
          : error.response?.status === 404
            ? "Loại giai đoạn không tồn tại"
            : error.response?.status === 403
              ? "Quyền truy cập bị từ chối"
              : error.response?.status === 422
                ? "Dữ liệu không hợp lệ"
                : "Không thể cập nhật loại giai đoạn")
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const deletePhaseType = async (phaseTypeId: string | number) => {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/phase-type/delete/${phaseTypeId}`,
    );

    const { success, message } = res.data;
    if (!success) {
      throw new Error(message || "Xóa loại giai đoạn thất bại");
    }

    toast.success(message || "Xóa loại giai đoạn thành công");
    return true;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        (error.response?.status === 409
          ? "Không thể xóa loại giai đoạn đang được sử dụng"
          : error.response?.status === 404
            ? "Loại giai đoạn không tồn tại"
            : error.response?.status === 403
              ? "Quyền truy cập bị từ chối"
              : "Không thể xóa loại giai đoạn")
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export type PhaseTypeCreateDto = {
  name: string;
  description: string | null;
};

export const createPhaseType = async (
  payload: PhaseTypeCreateDto,
): Promise<null> => {
  try {
    const res = await capBotAPI.post<ApiResponse<null>>(
      "/phase-type/create",
      payload,
    );
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Tạo loại giai đoạn thất bại");
    toast.success(message || "Tạo loại giai đoạn thành công");
    return null;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        (error.response?.status === 409
          ? "Tên loại giai đoạn đã tồn tại"
          : error.response?.status === 403
            ? "Quyền truy cập bị từ chối"
            : error.response?.status === 422
              ? "Dữ liệu không hợp lệ"
              : "Không thể tạo loại giai đoạn")
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
