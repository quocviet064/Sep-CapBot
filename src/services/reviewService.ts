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

type ErrorPayload =
  | { message?: unknown; errors?: unknown; title?: unknown; detail?: unknown }
  | string
  | null
  | undefined;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const getProp = <T>(obj: unknown, key: string): T | undefined =>
  isRecord(obj) ? (obj[key] as T | undefined) : undefined;

const pickFirst = <T>(
  obj: unknown,
  keys: string[],
  fallback?: T,
): T | undefined => {
  for (const k of keys) {
    const v = getProp<T>(obj, k);
    if (typeof v !== "undefined") return v;
  }
  return fallback;
};

const toNumber = (v: unknown, d = 0): number => {
  const n = Number(v);
  return Number.isNaN(n) ? d : n;
};

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const data = e.response?.data;
    if (typeof data === "string") return data || fallback;
    if (isRecord(data)) {
      const message = getProp<unknown>(data, "message");
      if (typeof message === "string" && message.trim()) return message;
      const title = getProp<unknown>(data, "title");
      if (typeof title === "string" && title.trim()) return title;
      const detail = getProp<unknown>(data, "detail");
      if (typeof detail === "string" && detail.trim()) return detail;
      const errors = getProp<unknown>(data, "errors");
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0];
        if (typeof first === "string") return first;
        if (isRecord(first) && typeof first.message === "string")
          return first.message;
      } else if (isRecord(errors)) {
        const keys = Object.keys(errors);
        if (keys.length > 0) {
          const val = errors[keys[0]];
          if (Array.isArray(val) && val.length > 0) return String(val[0]);
          if (typeof val === "string") return val;
        }
      }
    }
    const generic = (e as { message?: unknown }).message;
    if (typeof generic === "string" && generic.trim()) return generic;
  }
  return fallback;
};

export type ReviewStatus = "Draft" | "Submitted";

export type Recommendation = "Approve" | "Reject" | "Revise" | string;

export interface ReviewCriteriaScoreDTO {
  criteriaId: number;
  score: number;
  comment?: string | null;
  criteria?: {
    id: number;
    name: string;
    maxScore: number;
    weight: number;
  };
}

export interface ReviewDTO {
  id: IdLike;
  assignmentId: IdLike;
  overallScore?: number | null;
  overallComment?: string | null;
  status?: ReviewStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
  criteriaScores: ReviewCriteriaScoreDTO[];
}

export interface CreateReviewDTO {
  assignmentId: IdLike;
  criteriaScores: ReviewCriteriaScoreDTO[];
  overallComment?: string | null;
  recommendation?: Recommendation;
  timeSpentMinutes?: number | null;
}

export interface UpdateReviewDTO {
  id: IdLike;
  assignmentId: IdLike;
  criteriaScores: ReviewCriteriaScoreDTO[];
  overallScore?: number | null;
  overallComment?: string | null;
  recommendation?: Recommendation;
  timeSpentMinutes?: number | null;
}

export interface PagingModel {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
}

export const createReview = async (
  payload: CreateReviewDTO,
): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewDTO>>(
      "/reviews",
      payload,
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Tạo đánh giá thất bại");
    toast.success("Đã tạo đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể tạo đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const updateReview = async (
  payload: UpdateReviewDTO,
): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.put<ApiResponse<ReviewDTO>>(
      "/reviews",
      payload,
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Cập nhật đánh giá thất bại");
    toast.success("Đã cập nhật đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể cập nhật đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const deleteReview = async (id: IdLike): Promise<void> => {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(`/reviews/${id}`);
    if (!res.data.success) throw new Error(res.data.message || "Xoá thất bại");
    toast.success("Đã xoá đánh giá");
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể xoá đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getReviewById = async (id: IdLike): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewDTO>>(`/reviews/${id}`);
    if (!res.data.success)
      throw new Error(res.data.message || "Không lấy được đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export type ReviewListResponse = {
  paging: {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    keyword?: string | null;
  };
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: ReviewDTO[];
};

export const getReviews = async (
  paging: PagingModel,
): Promise<ReviewListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewListResponse>>(
      "/reviews",
      { params: paging },
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Không lấy được danh sách đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được danh sách đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const submitReview = async (id: IdLike): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewDTO>>(
      `/reviews/${id}/submit`,
      {},
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Submit thất bại");
    toast.success("Đã submit đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể submit đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getReviewsByAssignment = async (
  assignmentId: IdLike,
): Promise<ReviewDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewDTO[]>>(
      `/reviews/assignment/${assignmentId}`,
    );
    if (!res.data.success)
      throw new Error(
        res.data.message || "Không lấy được reviews của assignment",
      );
    return res.data.data ?? [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được reviews của assignment");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getScoreBoard = async (
  id: IdLike,
): Promise<{
  reviewId: IdLike;
  overallScore?: number | null;
  criteriaScores: {
    criteriaId: number;
    criteriaName: string;
    score: number;
    maxScore: number;
    weight: number;
    comment?: string | null;
  }[];
}> => {
  try {
    const res = await capBotAPI.get<unknown>(`/reviews/${id}/scores`);
    const payload = isRecord(res.data)
      ? pickFirst<unknown>(res.data, ["data", "Data"], res.data)
      : res.data;
    const inner =
      isRecord(payload) &&
      getProp<boolean>(payload, "isSuccess") &&
      getProp<unknown>(payload, "data")
        ? (payload as Record<string, unknown>)["data"]
        : payload;
    if (!isRecord(inner)) throw new Error("Không lấy được scoreboard");

    const reviewId = (getProp<IdLike>(inner, "reviewId") ??
      getProp<IdLike>(inner, "ReviewId")) as IdLike;
    const overallScore =
      getProp<number | null>(inner, "overallScore") ??
      getProp<number | null>(inner, "OverallScore") ??
      null;

    const rawScores =
      getProp<unknown[]>(inner, "criteriaScores") ??
      getProp<unknown[]>(inner, "CriteriaScores") ??
      [];

    const criteriaScores = Array.isArray(rawScores)
      ? rawScores.filter(isRecord).map((x) => {
          const criteriaObj =
            getProp<unknown>(x, "criteria") ?? getProp<unknown>(x, "Criteria");
          const criteriaName =
            getProp<string>(x, "criteriaName") ??
            getProp<string>(x, "CriteriaName") ??
            (isRecord(criteriaObj)
              ? getProp<string>(criteriaObj, "name")
              : undefined) ??
            "—";
          const maxScore = toNumber(
            getProp<unknown>(x, "maxScore") ??
              getProp<unknown>(x, "MaxScore") ??
              (isRecord(criteriaObj)
                ? getProp<unknown>(criteriaObj, "maxScore")
                : undefined),
            0,
          );
          const weight = toNumber(
            getProp<unknown>(x, "weight") ??
              getProp<unknown>(x, "Weight") ??
              (isRecord(criteriaObj)
                ? getProp<unknown>(criteriaObj, "weight")
                : undefined),
            0,
          );

          return {
            criteriaId: toNumber(
              getProp<unknown>(x, "criteriaId") ??
                getProp<unknown>(x, "CriteriaId"),
              0,
            ),
            criteriaName,
            score: toNumber(
              getProp<unknown>(x, "score") ?? getProp<unknown>(x, "Score"),
              0,
            ),
            maxScore,
            weight,
            comment:
              getProp<string | null>(x, "comment") ??
              getProp<string | null>(x, "Comment") ??
              null,
          };
        })
      : [];

    return { reviewId, overallScore, criteriaScores };
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được bảng điểm");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const withdrawReview = async (id: IdLike): Promise<void> => {
  try {
    const res = await capBotAPI.post<unknown>(`/reviews/${id}/withdraw`, {});
    const body = res.data;
    const explicitFail =
      (isRecord(body) && body.IsSuccess === false) ||
      (isRecord(body) && body.success === false) ||
      (isRecord(body) && body.ok === false);
    if (explicitFail) {
      const msg =
        (isRecord(body) && (body.Message as string)) ||
        (isRecord(body) && (body.message as string)) ||
        "Rút lại thất bại";
      throw new Error(msg);
    }
    toast.success(
      "Đã gửi yêu cầu rút lại (nếu BE chưa implement sẽ trả thông báo tạm thời).",
    );
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể rút lại đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const startReview = async (assignmentId: IdLike): Promise<void> => {
  try {
    await capBotAPI.post(
      `/reviewer-assignments/${assignmentId}/start-review`,
      {},
    );
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể bắt đầu phiên đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getReviewStatistics = async (): Promise<ReviewListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewListResponse>>(
      "/reviews/statistics",
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Không lấy được thống kê reviews");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được thống kê reviews");
    toast.error(msg);
    throw new Error(msg);
  }
};
