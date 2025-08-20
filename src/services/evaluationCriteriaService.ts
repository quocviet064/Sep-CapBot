import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export type IdLike = number | string;

type ApiResponse<T> = {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
};

type ErrorPayload = { message?: unknown } | string | null;

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const data = e.response?.data as any;
    const direct = data?.message;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof data === "string") return data || fallback;
  }
  return fallback;
};

export interface EvaluationCriteriaDTO {
  id: number;
  name: string;
  description?: string | null;
  maxScore?: number;
  weight?: number;
  order?: number;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** GET /api/evaluation-criteria/active */
export const getActiveEvaluationCriteria = async (): Promise<EvaluationCriteriaDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<unknown>>(
      "/evaluation-criteria/active"
    );

    if (res.data && (res.data as any).success === false) {
      throw new Error((res.data as any).message || "Không lấy được tiêu chí");
    }

    const payload = (res.data as any)?.data ?? (res.data as any)?.Data;

    if (Array.isArray(payload)) return payload as EvaluationCriteriaDTO[];
    if (payload && Array.isArray(payload.listObjects)) {
      return payload.listObjects as EvaluationCriteriaDTO[];
    }
    if (payload && Array.isArray(payload.items)) {
      return payload.items as EvaluationCriteriaDTO[];
    }

    return [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy danh sách tiêu chí đang hoạt động");
    toast.error(msg);
    throw new Error(msg);
  }
};
