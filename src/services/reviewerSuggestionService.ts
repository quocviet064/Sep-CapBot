import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export type IdLike = number | string;

export interface ReviewerSuggestionInputDTO {
  topicId?: number;
  topicVersionId?: number;
  submissionId?: number;
  maxSuggestions?: number;
  usePrompt?: boolean;
  deadline?: string | null;
}

export interface ReviewerSuggestionByTopicInputDTO {
  topicId: number;
  maxSuggestions?: number;
  usePrompt?: boolean;
  deadline?: string | null;
}

export interface ReviewerSuggestionBySubmissionInputDTO {
  SubmissionId: number;
  MaxSuggestions?: number;
  UsePrompt?: boolean;
  Deadline?: string | null;
}

export interface ReviewerSuggestionDTO {
  reviewerId: number;
  reviewerName?: string;
  skillMatchScore: number;
  matchedSkills: string[];
  reviewerSkills: Record<string, string>;
  skillMatchFieldScores?: Record<string, number>;
  skillMatchTopTokens?: Record<string, string[]>;
  detailScores?: Record<string, number>;
  currentActiveAssignments: number;
  completedAssignments: number;
  workloadScore: number;
  averageScoreGiven?: number | null;
  onTimeRate?: number | null;
  qualityRating?: number | null;
  performanceScore: number;
  overallScore: number;
  isEligible: boolean;
  ineligibilityReasons: string[];
}

export interface ReviewerSuggestionOutputDTO {
  suggestions: ReviewerSuggestionDTO[];
  aiExplanation?: string | null;
  assignmentResults?: any[];
  assignmentErrors?: string[] | null;
  skipMessages?: string[] | null;
}

export interface ReviewerEligibilityDTO {
  reviewerId: number;
  reviewerName?: string;
  isEligible: boolean;
  reasons: string[];
}

interface ApiResponse<T> {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError(e)) {
    const data = (e.response?.data ?? (e as any).data) as any;
    if (typeof data === "string") return data || fallback;
    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0];
        if (typeof first === "string") return first;
        if (first && typeof first.message === "string") return first.message;
      }
    }
    return (e as any).message ?? fallback;
  }
  return fallback;
};

const normalizeSuggestions = (raw: any): ReviewerSuggestionDTO[] => {
  if (!raw) return [];
  const suggestions = raw.Suggestions ?? raw.suggestions ?? raw.SuggestionsList ?? raw.suggestionsList ?? raw;
  if (Array.isArray(suggestions)) {
    return suggestions.map((s: any) => ({
      reviewerId: s.ReviewerId ?? s.reviewerId ?? s.reviewer?.id ?? s.id,
      reviewerName: s.ReviewerName ?? s.reviewerName ?? s.name ?? null,
      skillMatchScore: Number(s.SkillMatchScore ?? s.skillMatchScore ?? 0),
      matchedSkills: s.MatchedSkills ?? s.matchedSkills ?? s.matched_skills ?? [],
      reviewerSkills: s.ReviewerSkills ?? s.reviewerSkills ?? s.reviewer_skills ?? {},
      skillMatchFieldScores: s.SkillMatchFieldScores ?? s.skillMatchFieldScores ?? s.skill_match_field_scores ?? undefined,
      skillMatchTopTokens: s.SkillMatchTopTokens ?? s.skillMatchTopTokens ?? s.skill_match_top_tokens ?? undefined,
      detailScores: s.DetailScores ?? s.detailScores ?? s.detail_scores ?? undefined,
      currentActiveAssignments: Number(s.CurrentActiveAssignments ?? s.currentActiveAssignments ?? 0),
      completedAssignments: Number(s.CompletedAssignments ?? s.completedAssignments ?? 0),
      workloadScore: Number(s.WorkloadScore ?? s.workloadScore ?? 0),
      averageScoreGiven: s.AverageScoreGiven ?? s.averageScoreGiven ?? null,
      onTimeRate: s.OnTimeRate ?? s.onTimeRate ?? null,
      qualityRating: s.QualityRating ?? s.qualityRating ?? null,
      performanceScore: Number(s.PerformanceScore ?? s.performanceScore ?? 0),
      overallScore: Number(s.OverallScore ?? s.overallScore ?? 0),
      isEligible: Boolean(s.IsEligible ?? s.isEligible ?? true),
      ineligibilityReasons: s.IneligibilityReasons ?? s.ineligibilityReasons ?? s.ineligibility_reasons ?? [],
    }));
  }
  return [];
};

/** POST /api/reviewer-suggestion/ai-suggest */
export const aiSuggest = async (input: Partial<ReviewerSuggestionInputDTO>): Promise<ReviewerSuggestionOutputDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<any>>(`/reviewer-suggestion/ai-suggest`, input);
    if (!res.data.success) throw new Error(res.data.message || "Không lấy được gợi ý reviewer (AI)");
    const raw = res.data.data ?? {};
    const suggestions = normalizeSuggestions(raw);
    const aiExplanation = raw.AIExplanation ?? raw.aiExplanation ?? raw.aiExplanationText ?? null;
    const assignmentResults = raw.AssignmentResults ?? raw.assignmentResults ?? null;
    const assignmentErrors = raw.AssignmentErrors ?? raw.assignmentErrors ?? null;
    const skipMessages = raw.SkipMessages ?? raw.skipMessages ?? null;
    return {
      suggestions,
      aiExplanation,
      assignmentResults,
      assignmentErrors,
      skipMessages,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "AI suggest failed");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** GET /api/reviewer-suggestion/top?submissionId={id}&count={n} */
export const getTopReviewers = async (submissionId: IdLike, count = 5): Promise<ReviewerSuggestionDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<any>>(`/reviewer-suggestion/top`, { params: { submissionId: submissionId, count } });
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? [];
    return normalizeSuggestions(raw);
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được top reviewers");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** POST /api/reviewer-suggestion/ai-suggest-by-topic */
export const suggestByTopic = async (input: ReviewerSuggestionByTopicInputDTO): Promise<ReviewerSuggestionOutputDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<any>>(`/reviewer-suggestion/ai-suggest-by-topic`, input);
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? {};
    return {
      suggestions: normalizeSuggestions(raw),
      aiExplanation: raw.AIExplanation ?? raw.aiExplanation ?? null,
      assignmentResults: raw.AssignmentResults ?? raw.assignmentResults ?? null,
      assignmentErrors: raw.AssignmentErrors ?? raw.assignmentErrors ?? null,
      skipMessages: raw.SkipMessages ?? raw.skipMessages ?? null,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "AI suggest by topic failed");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** GET /api/reviewer-suggestion/check-eligibility-by-topic?reviewerId={rid}&topicId={tid} */
export const checkEligibilityByTopic = async (reviewerId: IdLike, topicId: IdLike): Promise<ReviewerEligibilityDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<any>>(`/reviewer-suggestion/check-eligibility-by-topic`, { params: { reviewerId, topicId } });
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? {};
    return {
      reviewerId: raw.ReviewerId ?? raw.reviewerId ?? raw.id,
      reviewerName: raw.ReviewerName ?? raw.reviewerName ?? null,
      isEligible: raw.IsEligible ?? raw.isEligible ?? Boolean(raw.isEligible),
      reasons: raw.Reasons ?? raw.reasons ?? raw.ineligibilityReasons ?? [],
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể kiểm tra eligibility");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** POST /api/reviewer-suggestion/ai-suggest-by-submission?assign={true|false} */
export const suggestBySubmission = async (
  input: ReviewerSuggestionBySubmissionInputDTO,
  assign = false
): Promise<ReviewerSuggestionOutputDTO> => {
  try {
    const url = assign ? `/reviewer-suggestion/ai-suggest-by-submission?assign=true` : `/reviewer-suggestion/ai-suggest-by-submission`;
    const res = await capBotAPI.post<ApiResponse<any>>(url, input);
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? {};
    return {
      suggestions: normalizeSuggestions(raw),
      aiExplanation: raw.AIExplanation ?? raw.aiExplanation ?? null,
      assignmentResults: raw.AssignmentResults ?? raw.assignmentResults ?? null,
      assignmentErrors: raw.AssignmentErrors ?? raw.assignmentErrors ?? null,
      skipMessages: raw.SkipMessages ?? raw.skipMessages ?? null,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "AI suggest by submission failed");
    toast.error(msg);
    throw new Error(msg);
  }
};