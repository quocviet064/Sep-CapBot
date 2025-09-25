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
    const data = e.response?.data;
    const direct = (data as any)?.message;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (typeof data === "string") return data || fallback;
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

// POST /api/reviews
export const createReview = async (payload: CreateReviewDTO): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewDTO>>("/reviews", payload);
    if (!res.data.success) throw new Error(res.data.message || "Tạo đánh giá thất bại");
    toast.success("Đã tạo đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể tạo đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// PUT /api/reviews
export const updateReview = async (payload: UpdateReviewDTO): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.put<ApiResponse<ReviewDTO>>("/reviews", payload);
    if (!res.data.success) throw new Error(res.data.message || "Cập nhật đánh giá thất bại");
    toast.success("Đã cập nhật đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể cập nhật đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// DELETE /api/reviews/{id}
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

// GET /api/reviews/{id}
export const getReviewById = async (id: IdLike): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewDTO>>(`/reviews/${id}`);
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// GET /api/reviews  (paging)
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

export const getReviews = async (paging: PagingModel): Promise<ReviewListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewListResponse>>("/reviews", { params: paging });
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được danh sách đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được danh sách đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// POST /api/reviews/{id}/submit
export const submitReview = async (id: IdLike): Promise<ReviewDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewDTO>>(`/reviews/${id}/submit`, {});
    if (!res.data.success) throw new Error(res.data.message || "Submit thất bại");
    toast.success("Đã submit đánh giá");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể submit đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// GET /api/reviews/assignment/{assignmentId}
export const getReviewsByAssignment = async (assignmentId: IdLike): Promise<ReviewDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewDTO[]>>(`/reviews/assignment/${assignmentId}`);
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được reviews của assignment");
    return res.data.data ?? [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được reviews của assignment");
    toast.error(msg);
    throw new Error(msg);
  }
};

// GET /api/reviews/{id}/scores  (score board)
export const getScoreBoard = async (id: IdLike): Promise<{
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
    const res = await capBotAPI.get<any>(`/reviews/${id}/scores`);
    const data = res.data?.data ?? res.data?.Data ?? res.data;
    if (!data) throw new Error("Không lấy được scoreboard");
    return {
      reviewId: data.ReviewId ?? data.reviewId,
      overallScore: data.OverallScore ?? data.overallScore,
      criteriaScores: (data.CriteriaScores ?? data.criteriaScores ?? []).map((x: any) => ({
        criteriaId: x.CriteriaId ?? x.criteriaId,
        criteriaName: x.CriteriaName ?? x.criteria?.name,
        score: x.Score,
        maxScore: x.MaxScore ?? x.criteria?.maxScore,
        weight: x.Weight ?? x.criteria?.weight,
        comment: x.Comment ?? x.comment ?? null,
      })),
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được bảng điểm");
    toast.error(msg);
    throw new Error(msg);
  }
};

// POST /api/reviews/{id}/withdraw 
export const withdrawReview = async (id: IdLike): Promise<void> => {
  try {
    const res = await capBotAPI.post<any>(`/reviews/${id}/withdraw`, {});
    if (res?.data?.IsSuccess === false) throw new Error(res?.data?.Message || "Rút lại thất bại");
    toast.success("Đã gửi yêu cầu rút lại (nếu BE chưa implement sẽ trả thông báo tạm thời).");
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể rút lại đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// POST /api/reviewer-assignments/{assignmentId}/start-review
export const startReview = async (assignmentId: IdLike): Promise<void> => {
  try {
    const res = await capBotAPI.post(`/reviewer-assignments/${assignmentId}/start-review`, {});
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể bắt đầu phiên đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

// GET /api/reviews/statistics
export const getReviewStatistics = async (): Promise<ReviewListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewListResponse>>("/reviews/statistics");
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được thống kê reviews");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được thống kê reviews");
    toast.error(msg);
    throw new Error(msg);
  }
};
