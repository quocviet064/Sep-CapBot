import capBotAPI from "@/lib/CapBotApi";
import axios, { AxiosError } from "axios";

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

export interface ApiEnvelope<T> {
  statusCode: string | number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export interface EvaluationCriteriaDTO {
  id: number;
  name: string;
  description: string | null;
  maxScore: number;
  weight: number;
  createdAt: string;
  lastModifiedAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  isActive: boolean;
  semesterId?: number;
}
type ApiResponse<T> = {
  statusCode: string | number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

export type GetCriteriaQuery = {
  PageNumber?: number;
  PageSize?: number;
  Keyword?: string;
  TotalRecord?: number;
};

export interface CriteriaListDTO<TItem> {
  paging: {
    pageNumber: number;
    pageSize: number;
    keyword: string | null;
    totalRecord: number;
  };
  listObjects: TItem[];
}

export type CriteriaPagedResponse = CriteriaListDTO<EvaluationCriteriaDTO> & {
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export interface CreateCriteriaPayload {
  name: string;
  description?: string;
  maxScore: number;
  weight: number;
  semesterId: number;
}

export interface UpdateCriteriaPayload {
  id: number;
  name?: string;
  description?: string;
  maxScore?: number;
  weight?: number;
  isActive?: boolean;
  semesterId: number;
}

export async function fetchCriteria(
  args: GetCriteriaQuery,
): Promise<CriteriaPagedResponse> {
  const { PageNumber = 1, PageSize = 10, Keyword, TotalRecord } = args ?? {};
  try {
    const params: Record<string, unknown> = {
      PageNumber,
      PageSize,
      Keyword,
      TotalRecord,
    };
    const res = await capBotAPI.get<
      ApiEnvelope<CriteriaListDTO<EvaluationCriteriaDTO>>
    >("/evaluation-criteria", { params });
    if (!res.data?.success)
      throw new Error(res.data?.message || "Không lấy được danh sách tiêu chí");
    const data = res.data.data;
    const total = data.paging.totalRecord ?? 0;
    const totalPages =
      PageSize > 0 ? Math.max(1, Math.ceil(total / PageSize)) : 1;
    const hasPreviousPage = PageNumber > 1;
    const hasNextPage = PageNumber < totalPages;
    return { ...data, totalPages, hasPreviousPage, hasNextPage };
  } catch (e) {
    throw new Error(getAxiosMessage(e, "Không lấy được danh sách tiêu chí"));
  }
}

export async function createCriteria(
  payload: CreateCriteriaPayload,
): Promise<EvaluationCriteriaDTO> {
  try {
    const res = await capBotAPI.post<ApiEnvelope<EvaluationCriteriaDTO>>(
      "/evaluation-criteria",
      payload,
      {
        headers: {
          "Content-Type":
            "application/json;odata.metadata=minimal;odata.streaming=true",
        },
      },
    );
    if (!res.data?.success)
      throw new Error(res.data?.message || "Tạo tiêu chí thất bại");
    return res.data.data;
  } catch (e) {
    throw new Error(getAxiosMessage(e, "Tạo tiêu chí thất bại"));
  }
}

export async function updateCriteria(
  payload: UpdateCriteriaPayload,
): Promise<EvaluationCriteriaDTO> {
  try {
    const res = await capBotAPI.put<ApiEnvelope<EvaluationCriteriaDTO>>(
      "/evaluation-criteria",
      payload,
      {
        headers: {
          "Content-Type":
            "application/json;odata.metadata=minimal;odata.streaming=true",
        },
      },
    );
    if (!res.data?.success)
      throw new Error(res.data?.message || "Cập nhật tiêu chí thất bại");
    return res.data.data;
  } catch (e) {
    throw new Error(getAxiosMessage(e, "Cập nhật tiêu chí thất bại"));
  }
}
export async function getCriteriaDetail(
  id: number,
): Promise<EvaluationCriteriaDTO> {
  const res = await capBotAPI.get<ApiResponse<EvaluationCriteriaDTO>>(
    `/evaluation-criteria/${id}`,
  );
  if (!res.data?.success || !res.data?.data)
    throw new Error(res.data?.message || "Không lấy được chi tiết tiêu chí");
  return res.data.data;
}

export async function getCriteriaForCurrentSemester(): Promise<EvaluationCriteriaDTO[]> {
  try {
    const res = await capBotAPI.get<ApiEnvelope<EvaluationCriteriaDTO[]>>(
      "/evaluation-criteria/current-semester",
    );
    if (!res.data?.success)
      throw new Error(res.data?.message || "Không lấy được tiêu chí của học kỳ hiện tại");
    return res.data.data ?? [];
  } catch (e) {
    throw new Error(getAxiosMessage(e, "Không lấy được tiêu chí của học kỳ hiện tại"));
  }
}