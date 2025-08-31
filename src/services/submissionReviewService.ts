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

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as any;
    if (typeof data === "string") return data || fallback;
    if (data?.message && typeof data.message === "string") return data.message;
  }
  return fallback;
};

export type ReviewerRecommendation = 1 | 2 | 3 | 4; // 1 Approve, 2 Minor, 3 Major, 4 Reject

export type SubmissionReviewSummaryDTO = {
  submissionId: IdLike;
  totalReviews: number;
  averageScore?: number | null;
  recommendationsCount?: {
    approve?: number;
    minor?: number;
    major?: number;
    reject?: number;
  };
  reviews: Array<{
    reviewId: IdLike;
    reviewerId?: IdLike;
    reviewerName?: string;
    overallScore?: number | null;
    recommendation?: ReviewerRecommendation;
    submittedAt?: string | null;
  }>;
  finalDecision?: {
    finalRecommendation?: ReviewerRecommendation | null;
    finalScore?: number | null;
    moderatorNotes?: string | null;
    revisionDeadline?: string | null;
    decidedAt?: string | null;
    decidedBy?: IdLike | null;
    decidedByName?: string | null;
  } | null;
};

/** GET /api/submission-reviews/{submissionId}/summary */
export const getSubmissionReviewSummary = async (
  submissionId: IdLike
): Promise<SubmissionReviewSummaryDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<SubmissionReviewSummaryDTO>>(
      `/submission-reviews/${encodeURIComponent(String(submissionId))}/summary`
    );
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được summary");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được tổng hợp đánh giá");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** POST /api/submission-reviews/moderator-final-review */
export const moderatorFinalReview = async (payload: {
  submissionId: IdLike;
  finalRecommendation: ReviewerRecommendation; // 1 approve, 2 minor, 3 major, 4 reject
  finalScore?: number;
  moderatorNotes?: string;
  revisionDeadline?: string;
}): Promise<void> => {
  try {
    const res = await capBotAPI.post<ApiResponse<null>>(
      `/submission-reviews/moderator-final-review`,
      payload
    );
    if (!res.data.success) throw new Error(res.data.message || "Không lưu được quyết định");
    toast.success("Đã lưu quyết định của Moderator");
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lưu được quyết định");
    toast.error(msg);
    throw new Error(msg);
  }
};
