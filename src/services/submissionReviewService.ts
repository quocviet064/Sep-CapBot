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

// helper: map bất kỳ value nào về ReviewerRecommendation
const mapRecommendation = (val: unknown): ReviewerRecommendation | undefined => {
  if (val == null) return undefined;

  if (typeof val === "number" && Number.isFinite(val)) {
    const n = Number(val);
    if (n >= 1 && n <= 4) return n as ReviewerRecommendation;
  }
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    if (v === "approve" || v === "accepted" || v === "accept") return 1;
    if (v === "minor" || v.includes("minor")) return 2;
    if (v === "major" || v.includes("major")) return 3;
    if (v === "reject" || v === "rejected" || v === "decline") return 4;

    // tiếng Việt
    if (v.includes("chấp nhận") || v.includes("đồng ý")) return 1;
    if (v.includes("nhỏ")) return 2;
    if (v.includes("lớn")) return 3;
    if (v.includes("từ chối")) return 4;

    const asNum = Number(v);
    if (Number.isFinite(asNum) && asNum >= 1 && asNum <= 4) {
      return asNum as ReviewerRecommendation;
    }
  }

  if (typeof val === "object") {
    try {
      const o: any = val as any;
      const candidates = [o.value, o.name, o.id, o.label, o.type];
      for (const c of candidates) {
        const mapped = mapRecommendation(c);
        if (mapped) return mapped;
      }
    } catch {}
  }

  return undefined;
};

/** GET /api/submission-reviews/{submissionId}/summary */
export const getSubmissionReviewSummary = async (
  submissionId: IdLike
): Promise<SubmissionReviewSummaryDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<unknown>>(
      `/submission-reviews/${encodeURIComponent(String(submissionId))}/summary`
    );
    if (!res.data.success) throw new Error((res.data as any).message || "Không lấy được summary");

    const raw: any = res.data.data ?? {};

    // Normalize reviews array (accept camelCase / PascalCase)
    const rawReviews = raw.reviews ?? raw.Reviews ?? [];
    const reviews = Array.isArray(rawReviews)
      ? rawReviews.map((r: any) => {
          const recommendationRaw =
            r.recommendation ?? r.Recommendation ?? r.recommend ?? r.Recommend;
          const recommendation = mapRecommendation(recommendationRaw);

          return {
            reviewId: r.reviewId ?? r.ReviewId ?? r.id,
            reviewerId: r.reviewerId ?? r.ReviewerId ?? r.reviewerId,
            reviewerName:
              r.reviewerName ??
              r.ReviewerName ??
              r.reviewerName ??
              r.reviewer ??
              undefined,
            overallScore:
              r.overallScore ?? r.OverallScore ?? r.overall_score ?? null,
            recommendation,
            submittedAt: r.submittedAt ?? r.SubmittedAt ?? null,
          };
        })
      : [];

    // totalReviews: prefer explicit field from backend, fallback to reviews.length
    const totalReviews =
      (Number.isFinite(Number(raw.completedReviewCount))
        ? Number(raw.completedReviewCount)
        : Number.isFinite(Number(raw.completedReviews))
        ? Number(raw.completedReviews)
        : reviews.length) || 0;

    // averageScore: map from finalScore or FinalScore
    const averageScore = raw.finalScore ?? raw.FinalScore ?? null;

    // recommendations count
    const recCounts = { approve: 0, minor: 0, major: 0, reject: 0 };
    for (const rv of reviews) {
      const rec = rv.recommendation;
      if (rec === 1) recCounts.approve++;
      else if (rec === 2) recCounts.minor++;
      else if (rec === 3) recCounts.major++;
      else if (rec === 4) recCounts.reject++;
    }

    // finalDecision mapping (if provided)
    const hasFinal =
      raw.finalRecommendation ??
      raw.FinalRecommendation ??
      raw.finalRecommendationValue ??
      null;

    const finalDecision = hasFinal
      ? {
          finalRecommendation: mapRecommendation(
            raw.finalRecommendation ??
              raw.FinalRecommendation ??
              raw.finalRecommendationValue
          ),
          finalScore: raw.finalScore ?? raw.FinalScore ?? null,
          moderatorNotes: raw.moderatorNotes ?? raw.ModeratorNotes ?? null,
          revisionDeadline: raw.revisionDeadline ?? raw.RevisionDeadline ?? null,
          decidedAt: raw.decidedAt ?? raw.DecidedAt ?? null,
          decidedBy: raw.decidedBy ?? raw.DecidedBy ?? null,
          decidedByName: raw.decidedByName ?? raw.DecidedByName ?? null,
        }
      : null;

    const mapped: SubmissionReviewSummaryDTO = {
      submissionId: raw.submissionId ?? raw.SubmissionId ?? submissionId,
      totalReviews,
      averageScore,
      recommendationsCount: recCounts,
      reviews,
      finalDecision,
    };

    return mapped;
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
    if (!res.data.success)
      throw new Error(res.data.message || "Không lưu được quyết định");
    toast.success("Đã lưu quyết định của Moderator");
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lưu được quyết định");
    toast.error(msg);
    throw new Error(msg);
  }
};
