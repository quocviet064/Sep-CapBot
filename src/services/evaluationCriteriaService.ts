import capBotAPI from "@/lib/CapBotApi";
import axios, { AxiosError } from "axios";

export type IdLike = number | string;

export type ApiResponse<T> = {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

type ErrorPayload = { message?: string | null } | string | null | undefined;

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const err = e as AxiosError<ErrorPayload>;
    const data = err.response?.data;
    if (typeof data === "string") return data || fallback;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: string | null }).message;
      if (typeof msg === "string") return msg || fallback;
    }
    return err.message || fallback;
  }
  return fallback;
};

export interface EvaluationCriteriaDTO {
  id: IdLike;
  name: string;
  description?: string | null;
  maxScore: number;
  weight: number;
  createdAt?: string | null;
  lastModifiedAt?: string | null;
  updatedAt?: string | null;
  isActive?: boolean;
}

export interface CreateEvaluationCriteriaDTO {
  name: string;
  description?: string | null;
  maxScore: number;
  weight: number;
}

export interface UpdateEvaluationCriteriaDTO {
  id: IdLike;
  name: string;
  description?: string | null;
  maxScore: number;
  weight: number;
}

export async function createEvaluationCriteria(
  payload: CreateEvaluationCriteriaDTO,
): Promise<EvaluationCriteriaDTO> {
  try {
    const res = await capBotAPI.post<ApiResponse<EvaluationCriteriaDTO>>(
      "/evaluation-criteria",
      payload,
    );
    if (!res.data?.success) {
      throw new Error(res.data?.message || "Tạo tiêu chí đánh giá thất bại");
    }
    return res.data.data;
  } catch (e: unknown) {
    throw new Error(getAxiosMessage(e, "Không thể tạo tiêu chí đánh giá"));
  }
}

export async function updateEvaluationCriteria(
  payload: UpdateEvaluationCriteriaDTO,
): Promise<EvaluationCriteriaDTO> {
  try {
    const res = await capBotAPI.put<ApiResponse<EvaluationCriteriaDTO>>(
      "/evaluation-criteria",
      payload,
    );
    if (!res.data?.success) {
      throw new Error(
        res.data?.message || "Cập nhật tiêu chí đánh giá thất bại",
      );
    }
    return res.data.data;
  } catch (e: unknown) {
    throw new Error(getAxiosMessage(e, "Không thể cập nhật tiêu chí đánh giá"));
  }
}

export async function deleteEvaluationCriteria(id: IdLike): Promise<void> {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/evaluation-criteria/${id}`,
    );
    if (!res.data?.success) {
      throw new Error(res.data?.message || "Xóa tiêu chí đánh giá thất bại");
    }
  } catch (e: unknown) {
    throw new Error(getAxiosMessage(e, "Không thể xóa tiêu chí đánh giá"));
  }
}

export async function getActiveEvaluationCriteria(): Promise<
  EvaluationCriteriaDTO[]
> {
  try {
    const res = await capBotAPI.get<ApiResponse<EvaluationCriteriaDTO[]>>(
      "/evaluation-criteria/active",
    );
    if (!res.data?.success) {
      throw new Error(
        res.data?.message || "Lấy danh sách tiêu chí (active) thất bại",
      );
    }
    return res.data.data || [];
  } catch (e: unknown) {
    throw new Error(
      getAxiosMessage(e, "Không thể tải danh sách tiêu chí (active)"),
    );
  }
}

export async function getEvaluationCriteriaById(
  id: IdLike,
): Promise<EvaluationCriteriaDTO> {
  try {
    const res = await capBotAPI.get<ApiResponse<EvaluationCriteriaDTO>>(
      `/evaluation-criteria/${id}`,
    );
    if (!res.data?.success) {
      throw new Error(
        res.data?.message || "Lấy chi tiết tiêu chí đánh giá thất bại",
      );
    }
    return res.data.data;
  } catch (e: unknown) {
    throw new Error(
      getAxiosMessage(e, "Không thể tải chi tiết tiêu chí đánh giá"),
    );
  }
}
