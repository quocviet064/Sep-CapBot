import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export type IdLike = number | string;

export enum AssignmentTypes {
  Primary = 1,
  Secondary = 2,
  Additional = 3,
}

export enum AssignmentStatus {
  Assigned = 1,
  InProgress = 2,
  Completed = 3,
  Overdue = 4,
}

export interface AssignReviewerDTO {
  submissionId: IdLike;
  reviewerId: IdLike;
  assignmentType: AssignmentTypes;
  deadline?: string;
  skillMatchScore?: number;
  notes?: string;
}

export interface BulkAssignReviewerDTO {
  assignments: AssignReviewerDTO[];
}

export interface AutoAssignReviewerDTO {
  submissionId: IdLike;
  maxWorkload?: number;
  prioritizeHighPerformance?: boolean;
  topicSkillTags?: string[];
}

export interface AvailableReviewerDTO {
  id: IdLike;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  currentAssignments: number;
  completedAssignments: number;
  averageScoreGiven?: number;
  onTimeRate?: number;
  qualityRating?: number;
  skills: Record<string, number>;
  skillMatchScore?: number;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface ReviewerAssignmentResponseDTO {
  id: IdLike;
  submissionId: IdLike;
  reviewerId: IdLike;
  assignedBy: IdLike;
  assignmentType: AssignmentTypes;
  skillMatchScore?: number;
  deadline?: string;
  status: AssignmentStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  reviewer?: { id: IdLike; userName: string };
  assignedByUser?: { id: IdLike; userName: string };
  submissionTitle?: string;
  topicTitle?: string;
  notes?: string;
}

export interface RecommendationQuery {
  minSkillScore?: number;
  maxWorkload?: number;
}

export interface RecommendedReviewerDTO {
  reviewerId: IdLike;
  reviewerName?: string;
  reviewerEmail?: string;

  skillMatchScore: number;
  matchedSkills: string[];
  reviewerSkills: Record<string, number>;

  currentActiveAssignments: number;
  completedAssignments: number;
  workloadScore: number;

  averageScoreGiven?: number;
  onTimeRate?: number;
  qualityRating?: number;
  performanceScore: number;

  overallScore: number;
  isEligible: boolean;
  ineligibilityReasons: string[];
}

export interface SuggestedReviewerItem {
  reviewerId: IdLike;
  assignmentType?: AssignmentTypes | null;
  deadline?: string | null;
  skillMatchScore?: number | null;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
}

export interface ReviewerSuggestionInputDTO {
  submissionId: number;
  maxSuggestions?: number;
  usePrompt?: boolean;
  deadline?: string | null;
}

export interface AssignFromSuggestionDTO {
  submissionId: number;
  reviewerId: number;
  assignmentType?: AssignmentTypes | null;
  deadline?: string | null;
  createdBy?: number | string | null;
}

interface ApiResponse<T> {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

/* ---------- type-safe helpers ---------- */

type ErrorItem = { message?: string } | string;
type ErrorPayload =
  | {
      message?: string;
      errors?: Record<string, unknown> | ErrorItem[];
      title?: string;
      detail?: string;
    }
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

const toNumber = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const data = e.response?.data;

    if (typeof data === "string") return data || fallback;
    if (isRecord(data)) {
      const message = getProp<string>(data, "message");
      if (message && message.trim()) return message;

      const title = getProp<string>(data, "title");
      if (title && title.trim()) return title;

      const detail = getProp<string>(data, "detail");
      if (detail && detail.trim()) return detail;

      const errors = getProp<unknown>(data, "errors");
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0];
        if (typeof first === "string") return first;
        if (isRecord(first) && typeof first.message === "string")
          return first.message;
      }
      if (isRecord(errors)) {
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
    return fallback;
  }
  return fallback;
};

const normalizeArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  const items = getProp<unknown>(value, "items");
  return Array.isArray(items) ? (items as T[]) : [];
};

const AssignmentTypeStringToNumber: Record<string, AssignmentTypes> = {
  Primary: AssignmentTypes.Primary,
  Secondary: AssignmentTypes.Secondary,
  Additional: AssignmentTypes.Additional,
};

const AssignmentStatusStringToNumber: Record<string, AssignmentStatus> = {
  Assigned: AssignmentStatus.Assigned,
  InProgress: AssignmentStatus.InProgress,
  Completed: AssignmentStatus.Completed,
  Overdue: AssignmentStatus.Overdue,
};

const normalizeAssignmentType = (v: unknown): AssignmentTypes | undefined => {
  if (typeof v === "number") return v as AssignmentTypes;
  if (typeof v === "string") {
    if (AssignmentTypeStringToNumber[v]) return AssignmentTypeStringToNumber[v];
    const n = toNumber(v);
    if (typeof n === "number") return n as AssignmentTypes;
  }
  return undefined;
};

const normalizeAssignmentStatus = (
  v: unknown,
): AssignmentStatus | undefined => {
  if (typeof v === "number") return v as AssignmentStatus;
  if (typeof v === "string") {
    if (AssignmentStatusStringToNumber[v])
      return AssignmentStatusStringToNumber[v];
    const n = toNumber(v);
    if (typeof n === "number") return n as AssignmentStatus;
  }
  return undefined;
};

/* ---------- API calls ---------- */

/** Phân công 1 reviewer */
export const assignReviewer = async (
  payload: AssignReviewerDTO,
): Promise<ReviewerAssignmentResponseDTO> => {
  try {
    const res = await capBotAPI.post<
      ApiResponse<ReviewerAssignmentResponseDTO>
    >("/reviewer-assignments", payload);
    if (!res.data.success)
      throw new Error(res.data.message || "Phân công thất bại");
    toast.success("Đã phân công reviewer");
    const d = res.data.data;
    return {
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    };
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể phân công reviewer");
    throw new Error(msg);
  }
};

/** Phân công hàng loạt */
export const bulkAssignReviewers = async (
  payload: BulkAssignReviewerDTO,
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.post<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >("/reviewer-assignments/bulk", payload);
    if (!res.data.success)
      throw new Error(res.data.message || "Bulk assign thất bại");
    toast.success("Phân công hàng loạt thành công");
    const list = res.data.data ?? [];
    return list.map((d) => ({
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    }));
  } catch (e) {
    const msg = getAxiosMessage(e, "Bulk assign thất bại");
    throw new Error(msg);
  }
};

/** Reviewer khả dụng theo submission */
export const getAvailableReviewers = async (
  submissionId: IdLike,
): Promise<AvailableReviewerDTO[]> => {
  try {
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<AvailableReviewerDTO[]>>(
      `/reviewer-assignments/available/${sid}`,
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Lấy reviewer khả dụng thất bại");
    return res.data.data ?? [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Assignments theo submission */
export const getAssignmentsBySubmission = async (
  submissionId: IdLike,
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >(`/reviewer-assignments/by-submission/${sid}`);
    if (!res.data.success)
      throw new Error(res.data.message || "Lấy assignments thất bại");
    const data = res.data.data ?? [];
    return data.map((d) => ({
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    }));
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy assignments");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Cập nhật trạng thái */
export const updateAssignmentStatus = async (
  assignmentId: IdLike,
  status: AssignmentStatus,
): Promise<void> => {
  try {
    const id = encodeURIComponent(String(assignmentId));
    const res = await capBotAPI.put<ApiResponse<null>>(
      `/reviewer-assignments/${id}/status`,
      { status },
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Cập nhật status thất bại");
    toast.success("Cập nhật trạng thái thành công");
  } catch (e) {
    const msg = getAxiosMessage(e, "Cập nhật status thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Huỷ assignment */
export const cancelAssignment = async (assignmentId: IdLike): Promise<void> => {
  try {
    const id = encodeURIComponent(String(assignmentId));
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/reviewer-assignments/${id}`,
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Hủy assignment thất bại");
  } catch (e) {
    const msg = getAxiosMessage(e, "Hủy assignment thất bại");
    throw new Error(msg);
  }
};

/** Auto-assign 1 submission */
export const autoAssignReviewers = async (
  payload: AutoAssignReviewerDTO,
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.post<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >("/reviewer-assignments/auto-assign", {
      submissionId: payload.submissionId,
      maxWorkload: payload.maxWorkload,
      prioritizeHighPerformance: payload.prioritizeHighPerformance,
      topicSkillTags: payload.topicSkillTags,
    });
    if (!res.data.success)
      throw new Error(res.data.message || "Auto assign thất bại");
    toast.success("Auto assign thành công");
    const list = res.data.data ?? [];
    return list.map((d) => ({
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    }));
  } catch (e) {
    const msg = getAxiosMessage(e, "Auto assign thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

type SuggestionRaw = Record<string, unknown>;

/** Lấy gợi ý reviewer theo submission (có thể kèm assign) */
export const getReviewerSuggestions = async (
  submissionId: IdLike,
  maxSuggestions = 5,
  usePrompt = true,
  deadline?: string | null,
  assign = false,
): Promise<SuggestedReviewerItem[]> => {
  try {
    const payload: ReviewerSuggestionInputDTO = {
      submissionId: Number(submissionId),
      maxSuggestions,
      usePrompt,
      deadline: deadline ?? null,
    };

    const url = assign
      ? `/reviewer-suggestion/ai-suggest-by-submission?assign=true`
      : `/reviewer-suggestion/ai-suggest-by-submission`;

    const res = await capBotAPI.post<ApiResponse<unknown>>(url, payload);
    if (!res.data.success)
      throw new Error(res.data.message || "Không lấy được gợi ý");

    const raw = res.data.data ?? {};
    const suggestionsSrc =
      pickFirst<unknown>(
        raw,
        ["Suggestions", "suggestions", "suggestionsList"],
        raw,
      ) ?? [];
    const list = Array.isArray(suggestionsSrc)
      ? (suggestionsSrc as SuggestionRaw[])
      : normalizeArray<SuggestionRaw>(suggestionsSrc);

    return list.map((r) => {
      const reviewer =
        getProp<number | string>(r, "reviewerId") ??
        getProp<number | string>(r, "ReviewerId") ??
        getProp<number | string>(getProp(r, "reviewer"), "id") ??
        getProp<number | string>(r, "id") ??
        "";

      const typeRaw =
        getProp<unknown>(r, "assignmentType") ??
        getProp<unknown>(r, "AssignmentType");

      const dl =
        getProp<string | null>(r, "deadline") ??
        getProp<string | null>(r, "Deadline") ??
        null;

      const score =
        toNumber(
          getProp<unknown>(r, "skillMatchScore") ??
            getProp<unknown>(r, "SkillMatchScore"),
        ) ?? null;

      const name =
        getProp<string>(r, "reviewerName") ??
        getProp<string>(r, "ReviewerName") ??
        getProp<string>(r, "name") ??
        null;

      const email =
        getProp<string>(r, "reviewerEmail") ??
        getProp<string>(r, "ReviewerEmail") ??
        null;

      return {
        reviewerId: reviewer,
        assignmentType: normalizeAssignmentType(typeRaw) ?? null,
        deadline: dl,
        skillMatchScore: score,
        reviewerName: name,
        reviewerEmail: email,
      };
    });
  } catch (e) {
    const msg = getAxiosMessage(e, "Không lấy được gợi ý reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const assignFromSuggestion = async (
  payload: AssignFromSuggestionDTO,
): Promise<ReviewerAssignmentResponseDTO> => {
  const assignPayload: AssignReviewerDTO = {
    submissionId: payload.submissionId,
    reviewerId: payload.reviewerId,
    assignmentType:
      (payload.assignmentType as AssignmentTypes) ?? AssignmentTypes.Primary,
    deadline: payload.deadline ?? undefined,
    notes: undefined,
    skillMatchScore: undefined,
  };
  return assignReviewer(assignPayload);
};

export interface ReviewerWorkloadDTO {
  id: number;
  userName: string;
  email: string;
  phoneNumber?: string;
  currentAssignments: number;
  skills: string[];
  isAvailable: boolean;
  unavailableReason?: string;
  performance?: {
    totalAssignments: number;
    completedAssignments: number;
    averageScoreGiven: number;
    onTimeRate: number;
  };
}

/** Thống kê workload reviewers */
export const getReviewersWorkload = async (
  semesterId?: IdLike,
): Promise<ReviewerWorkloadDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<unknown>>(
      `/reviewer-assignments/workload`,
      {
        params: semesterId != null ? { semesterId } : undefined,
      },
    );

    if (!res.data.success)
      throw new Error(res.data.message || "Lấy thống kê thất bại");

    const raw = (res.data.data ?? []) as unknown[];

    return raw.filter(isRecord).map((r) => {
      const perf = getProp<unknown>(r, "performance");
      const perfRec = isRecord(perf) ? perf : undefined;

      return {
        id: Number(getProp<unknown>(r, "id")),
        userName: String(getProp<unknown>(r, "userName") ?? ""),
        email: String(getProp<unknown>(r, "email") ?? ""),
        phoneNumber: getProp<string>(r, "phoneNumber"),
        currentAssignments: Number(
          getProp<unknown>(r, "currentAssignments") ?? 0,
        ),
        skills: Array.isArray(getProp<unknown>(r, "skills"))
          ? (getProp<unknown>(r, "skills") as string[])
          : [],
        isAvailable: Boolean(getProp<unknown>(r, "isAvailable") ?? false),
        unavailableReason: getProp<string>(r, "unavailableReason"),
        performance: perfRec
          ? {
              totalAssignments: Number(
                getProp<unknown>(perfRec, "totalAssignments") ?? 0,
              ),
              completedAssignments: Number(
                getProp<unknown>(perfRec, "completedAssignments") ?? 0,
              ),
              averageScoreGiven: Number(
                getProp<unknown>(perfRec, "averageScoreGiven") ?? 0,
              ),
              onTimeRate: Number(getProp<unknown>(perfRec, "onTimeRate") ?? 0),
            }
          : undefined,
      } as ReviewerWorkloadDTO;
    });
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy thống kê workload reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

export interface AnalyzeReviewerMatchDTO {
  reviewerId: IdLike;
  submissionId: IdLike;
  skillMatchScore: number;
  matchedSkills: string[];
  reviewerSkills: Record<string, number>;
  workloadScore: number;
  performanceScore: number;
  overallScore: number;
  isEligible?: boolean;
  reasons?: string[];
  ineligibilityReasons?: string[];
}

/** Phân tích matching */
export const analyzeReviewerMatch = async (
  reviewerId: IdLike,
  submissionId: IdLike,
): Promise<AnalyzeReviewerMatchDTO> => {
  try {
    const rid = encodeURIComponent(String(reviewerId));
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<AnalyzeReviewerMatchDTO>>(
      `/reviewer-assignments/analyze/${rid}/${sid}`,
    );
    if (!res.data.success)
      throw new Error(res.data.message || "Phân tích thất bại");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(
      e,
      "Không thể phân tích mức độ phù hợp reviewer",
    );
    toast.error(msg);
    throw new Error(msg);
  }
};

export interface MyAssignmentStatisticsDTO {
  total?: number;
  assigned?: number;
  inProgress?: number;
  completed?: number;
  overdue?: number;
}

export const getMyAssignments = async (): Promise<
  ReviewerAssignmentResponseDTO[]
> => {
  try {
    const res = await capBotAPI.get<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >(`/reviewer-assignments/my-assignments`);
    if (!res.data.success)
      throw new Error(res.data.message || "Lấy phân công của bạn thất bại");
    const data = res.data.data ?? [];
    return data.map((d) => ({
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    }));
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy danh sách phân công của bạn");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getMyAssignmentsByStatus = async (
  status: AssignmentStatus,
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const s = encodeURIComponent(String(status));
    const res = await capBotAPI.get<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >(`/reviewer-assignments/my-assignments/by-status/${s}`);
    if (!res.data.success)
      throw new Error(
        res.data.message || "Lấy phân công theo trạng thái thất bại",
      );
    const data = res.data.data ?? [];
    return data.map((d) => ({
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    }));
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy phân công theo trạng thái");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getMyAssignmentStatistics =
  async (): Promise<MyAssignmentStatisticsDTO> => {
    try {
      const res = await capBotAPI.get<ApiResponse<MyAssignmentStatisticsDTO>>(
        `/reviewer-assignments/my-assignments/statistics`,
      );
      if (!res.data.success)
        throw new Error(res.data.message || "Lấy thống kê phân công thất bại");
      return res.data.data ?? {};
    } catch (e) {
      const msg = getAxiosMessage(
        e,
        "Không thể lấy thống kê phân công của bạn",
      );
      toast.error(msg);
      throw new Error(msg);
    }
  };
export const getAssignmentsByReviewer = async (
  reviewerId: IdLike,
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const rid = encodeURIComponent(String(reviewerId));
    const res = await capBotAPI.get<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >(`/reviewer-assignments/by-reviewer/${rid}`);

    if (!res.data.success)
      throw new Error(res.data.message || "Không thể lấy assignments reviewer");

    const data = res.data.data ?? [];
    return data.map((d) => ({
      ...d,
      assignmentType:
        normalizeAssignmentType(d.assignmentType) ?? d.assignmentType,
      status: normalizeAssignmentStatus(d.status) ?? d.status,
    }));
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy assignments reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};
export const getRecommendedReviewers = async (
  submissionId: IdLike,
  query?: RecommendationQuery,
): Promise<RecommendedReviewerDTO[]> => {
  try {
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<RecommendedReviewerDTO[]>>(
      `/reviewer-assignments/recommendations/${sid}`,
      {
        params: query,
      },
    );

    if (!res.data.success)
      throw new Error(res.data.message || "Không thể lấy gợi ý reviewer");

    return res.data.data ?? [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy gợi ý reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};
