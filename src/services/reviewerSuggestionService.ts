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
  reviewerName?: string | null;
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
  assignmentResults?: unknown[];
  assignmentErrors?: string[] | null;
  skipMessages?: string[] | null;
}

export interface ReviewerEligibilityDTO {
  reviewerId: number;
  reviewerName?: string | null;
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

type ErrorItem = { message?: string } | string;
type ErrorPayload =
  | { message?: string; errors?: ErrorItem[] }
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

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const asRecordNumber = (v: unknown): Record<string, number> => {
  if (!isRecord(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v)) {
    const n = Number(val);
    if (!Number.isNaN(n)) out[k] = n;
  }
  return out;
};

const asRecordString = (v: unknown): Record<string, string> => {
  if (!isRecord(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === "string") out[k] = val;
  }
  return out;
};

const asRecordStringArray = (v: unknown): Record<string, string[]> => {
  if (!isRecord(v)) return {};
  const out: Record<string, string[]> = {};
  for (const [k, val] of Object.entries(v)) {
    out[k] = asStringArray(val);
  }
  return out;
};

const toNum = (v: unknown, d = 0): number => {
  const n = Number(v);
  return Number.isNaN(n) ? d : n;
};

const toBool = (v: unknown, d = false): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string")
    return ["true", "1", "yes"].includes(v.toLowerCase());
  return d;
};

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const data = e.response?.data;
    if (typeof data === "string") return data || fallback;
    if (isRecord(data)) {
      const msg = getProp<unknown>(data, "message");
      if (typeof msg === "string" && msg.trim()) return msg;
      const errs = getProp<unknown>(data, "errors");
      if (Array.isArray(errs) && errs.length > 0) {
        const first = errs[0];
        if (typeof first === "string") return first;
        if (isRecord(first) && typeof first.message === "string")
          return first.message;
      }
    }
    const generic = (e as { message?: unknown }).message;
    if (typeof generic === "string" && generic.trim()) return generic;
    return fallback;
  }
  const generic = (e as { message?: unknown })?.message;
  return typeof generic === "string" && generic.trim() ? generic : fallback;
};

const normalizeSuggestions = (raw: unknown): ReviewerSuggestionDTO[] => {
  const suggestionsSrc =
    pickFirst<unknown>(
      raw,
      ["Suggestions", "suggestions", "SuggestionsList", "suggestionsList"],
      raw,
    ) ?? [];
  if (!Array.isArray(suggestionsSrc)) return [];
  return suggestionsSrc.map((s) => {
    const rec = isRecord(s) ? s : {};
    const reviewerId =
      getProp<number>(rec, "ReviewerId") ??
      getProp<number>(rec, "reviewerId") ??
      getProp<number>(getProp(rec, "reviewer"), "id") ??
      getProp<number>(rec, "id") ??
      0;

    const reviewerName =
      getProp<string>(rec, "ReviewerName") ??
      getProp<string>(rec, "reviewerName") ??
      getProp<string>(rec, "name") ??
      null;

    const matchedSkills =
      getProp<string[]>(rec, "MatchedSkills") ??
      getProp<string[]>(rec, "matchedSkills") ??
      getProp<string[]>(rec, "matched_skills") ??
      [];

    const reviewerSkills =
      getProp<Record<string, string>>(rec, "ReviewerSkills") ??
      getProp<Record<string, string>>(rec, "reviewerSkills") ??
      getProp<Record<string, string>>(rec, "reviewer_skills") ??
      {};

    const fieldScores =
      getProp<Record<string, number>>(rec, "SkillMatchFieldScores") ??
      getProp<Record<string, number>>(rec, "skillMatchFieldScores") ??
      getProp<Record<string, number>>(rec, "skill_match_field_scores");

    const topTokens =
      getProp<Record<string, string[]>>(rec, "SkillMatchTopTokens") ??
      getProp<Record<string, string[]>>(rec, "skillMatchTopTokens") ??
      getProp<Record<string, string[]>>(rec, "skill_match_top_tokens");

    const detailScores =
      getProp<Record<string, number>>(rec, "DetailScores") ??
      getProp<Record<string, number>>(rec, "detailScores") ??
      getProp<Record<string, number>>(rec, "detail_scores");

    return {
      reviewerId,
      reviewerName,
      skillMatchScore: toNum(
        getProp<unknown>(rec, "SkillMatchScore") ??
          getProp<unknown>(rec, "skillMatchScore"),
        0,
      ),
      matchedSkills: asStringArray(matchedSkills),
      reviewerSkills: asRecordString(reviewerSkills),
      skillMatchFieldScores: fieldScores
        ? asRecordNumber(fieldScores)
        : undefined,
      skillMatchTopTokens: topTokens
        ? asRecordStringArray(topTokens)
        : undefined,
      detailScores: detailScores ? asRecordNumber(detailScores) : undefined,
      currentActiveAssignments: toNum(
        getProp<unknown>(rec, "CurrentActiveAssignments") ??
          getProp<unknown>(rec, "currentActiveAssignments"),
        0,
      ),
      completedAssignments: toNum(
        getProp<unknown>(rec, "CompletedAssignments") ??
          getProp<unknown>(rec, "completedAssignments"),
        0,
      ),
      workloadScore: toNum(
        getProp<unknown>(rec, "WorkloadScore") ??
          getProp<unknown>(rec, "workloadScore"),
        0,
      ),
      averageScoreGiven:
        getProp<number | null>(rec, "AverageScoreGiven") ??
        getProp<number | null>(rec, "averageScoreGiven") ??
        null,
      onTimeRate:
        getProp<number | null>(rec, "OnTimeRate") ??
        getProp<number | null>(rec, "onTimeRate") ??
        null,
      qualityRating:
        getProp<number | null>(rec, "QualityRating") ??
        getProp<number | null>(rec, "qualityRating") ??
        null,
      performanceScore: toNum(
        getProp<unknown>(rec, "PerformanceScore") ??
          getProp<unknown>(rec, "performanceScore"),
        0,
      ),
      overallScore: toNum(
        getProp<unknown>(rec, "OverallScore") ??
          getProp<unknown>(rec, "overallScore"),
        0,
      ),
      isEligible: toBool(
        getProp<unknown>(rec, "IsEligible") ??
          getProp<unknown>(rec, "isEligible"),
        true,
      ),
      ineligibilityReasons:
        asStringArray(
          getProp<string[]>(rec, "IneligibilityReasons") ??
            getProp<string[]>(rec, "ineligibilityReasons") ??
            getProp<string[]>(rec, "ineligibility_reasons"),
        ) ?? [],
    };
  });
};

export const aiSuggest = async (
  input: Partial<ReviewerSuggestionInputDTO>,
): Promise<ReviewerSuggestionOutputDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<unknown>>(
      `/reviewer-suggestion/ai-suggest`,
      input,
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Không lấy được gợi ý reviewer (AI)");
    const raw = res.data.data ?? {};
    return {
      suggestions: normalizeSuggestions(raw),
      aiExplanation:
        pickFirst<string | null>(
          raw,
          ["AIExplanation", "aiExplanation", "aiExplanationText"],
          null,
        ) ?? null,
      assignmentResults:
        pickFirst<unknown[]>(
          raw,
          ["AssignmentResults", "assignmentResults"],
          [],
        ) ?? [],
      assignmentErrors:
        pickFirst<string[] | null>(
          raw,
          ["AssignmentErrors", "assignmentErrors"],
          null,
        ) ?? null,
      skipMessages:
        pickFirst<string[] | null>(
          raw,
          ["SkipMessages", "skipMessages"],
          null,
        ) ?? null,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "AI suggest failed");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getTopReviewers = async (
  submissionId: IdLike,
  count = 5,
): Promise<ReviewerSuggestionDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<unknown>>(
      `/reviewer-suggestion/top`,
      {
        params: { submissionId, count },
      },
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? [];
    return normalizeSuggestions(raw);
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được top reviewers");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const suggestByTopic = async (
  input: ReviewerSuggestionByTopicInputDTO,
): Promise<ReviewerSuggestionOutputDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<unknown>>(
      `/reviewer-suggestion/ai-suggest-by-topic`,
      input,
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? {};
    return {
      suggestions: normalizeSuggestions(raw),
      aiExplanation:
        pickFirst<string | null>(
          raw,
          ["AIExplanation", "aiExplanation"],
          null,
        ) ?? null,
      assignmentResults:
        pickFirst<unknown[]>(
          raw,
          ["AssignmentResults", "assignmentResults"],
          [],
        ) ?? [],
      assignmentErrors:
        pickFirst<string[] | null>(
          raw,
          ["AssignmentErrors", "assignmentErrors"],
          null,
        ) ?? null,
      skipMessages:
        pickFirst<string[] | null>(
          raw,
          ["SkipMessages", "skipMessages"],
          null,
        ) ?? null,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "AI suggest by topic failed");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const checkEligibilityByTopic = async (
  reviewerId: IdLike,
  topicId: IdLike,
): Promise<ReviewerEligibilityDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<unknown>>(
      `/reviewer-suggestion/check-eligibility-by-topic`,
      {
        params: { reviewerId, topicId },
      },
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? {};
    return {
      reviewerId:
        pickFirst<number>(raw, ["ReviewerId", "reviewerId", "id"], 0) ?? 0,
      reviewerName:
        pickFirst<string>(
          raw,
          ["ReviewerName", "reviewerName"],
          null as unknown as string,
        ) ?? null,
      isEligible: toBool(
        pickFirst<unknown>(raw, ["IsEligible", "isEligible"]),
        false,
      ),
      reasons:
        pickFirst<string[]>(
          raw,
          ["Reasons", "reasons", "ineligibilityReasons"],
          [],
        ) ?? [],
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể kiểm tra eligibility");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const suggestBySubmission = async (
  input: ReviewerSuggestionBySubmissionInputDTO,
  assign = false,
): Promise<ReviewerSuggestionOutputDTO> => {
  try {
    const url = assign
      ? `/reviewer-suggestion/ai-suggest-by-submission?assign=true`
      : `/reviewer-suggestion/ai-suggest-by-submission`;
    const res = await capBotAPI.post<ApiResponse<unknown>>(url, input);
    if (!res.data.success) throw new Error(res.data.message || "");
    const raw = res.data.data ?? {};
    return {
      suggestions: normalizeSuggestions(raw),
      aiExplanation:
        pickFirst<string | null>(
          raw,
          ["AIExplanation", "aiExplanation"],
          null,
        ) ?? null,
      assignmentResults:
        pickFirst<unknown[]>(
          raw,
          ["AssignmentResults", "assignmentResults"],
          [],
        ) ?? [],
      assignmentErrors:
        pickFirst<string[] | null>(
          raw,
          ["AssignmentErrors", "assignmentErrors"],
          null,
        ) ?? null,
      skipMessages:
        pickFirst<string[] | null>(
          raw,
          ["SkipMessages", "skipMessages"],
          null,
        ) ?? null,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "AI suggest by submission failed");
    toast.error(msg);
    throw new Error(msg);
  }
};
