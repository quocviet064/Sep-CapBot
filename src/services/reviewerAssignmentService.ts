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

interface ApiResponse<T> {
  statusCode: number | string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as any;
    if (typeof data === "string") return data || fallback;
    if (data?.message && typeof data.message === "string") return data.message;
  }
  return fallback;
};

/** Phân công 1 reviewer */
export const assignReviewer = async (
  payload: AssignReviewerDTO
): Promise<ReviewerAssignmentResponseDTO> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewerAssignmentResponseDTO>>(
      "/reviewer-assignments",
      payload
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Đã phân công reviewer");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể phân công reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Phân công hàng loạt */
export const bulkAssignReviewers = async (
  payload: BulkAssignReviewerDTO
): Promise<ApiResponse<ReviewerAssignmentResponseDTO[]>> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewerAssignmentResponseDTO[]>>(
      "/reviewer-assignments/bulk",
      payload
    );
    return res.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Bulk assign thất bại");
    throw new Error(msg);
  }
};

/** Reviewer khả dụng theo submission */
export const getAvailableReviewers = async (
  submissionId: IdLike
): Promise<AvailableReviewerDTO[]> => {
  try {
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<AvailableReviewerDTO[]>>(
      `/reviewer-assignments/available/${sid}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Assignments theo submission */
export const getAssignmentsBySubmission = async (
  submissionId: IdLike
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<ReviewerAssignmentResponseDTO[]>>(
      `/reviewer-assignments/by-submission/${sid}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy assignments");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Cập nhật trạng thái */
export const updateAssignmentStatus = async (
  assignmentId: IdLike,
  status: AssignmentStatus
): Promise<void> => {
  try {
    const res = await capBotAPI.put<ApiResponse<null>>(
      `/reviewer-assignments/${assignmentId}/status`, { status }
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Cập nhật status thành công");
  } catch (e) {
    const msg = getAxiosMessage(e, "Cập nhật status thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Huỷ assignment */
export const cancelAssignment = async (assignmentId: IdLike): Promise<void> => {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/reviewer-assignments/${assignmentId}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Hủy assignment thành công");
  } catch (e) {
    const msg = getAxiosMessage(e, "Hủy assignment thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Auto-assign 1 submission */
export const autoAssignReviewers = async (
  payload: AutoAssignReviewerDTO
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.post<ApiResponse<ReviewerAssignmentResponseDTO[]>>(
      "/reviewer-assignments/auto-assign",
      {
        submissionId: payload.submissionId,
        maxWorkload: payload.maxWorkload,
        prioritizeHighPerformance: payload.prioritizeHighPerformance,
        topicSkillTags: payload.topicSkillTags,
      }
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Auto assign thành công");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Auto assign thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Gợi ý reviewer */
export async function getRecommendedReviewers(
  submissionId: IdLike,
  query?: RecommendationQuery
): Promise<RecommendedReviewerDTO[]> {
  try {
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<RecommendedReviewerDTO[]>>(
      `/reviewer-assignments/recommendations/${sid}`,
      { params: { minSkillScore: query?.minSkillScore, maxWorkload: query?.maxWorkload } }
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy danh sách gợi ý reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
}

/** Assignments theo reviewer */
export const getAssignmentsByReviewer = async (
  reviewerId: IdLike
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const rid = encodeURIComponent(String(reviewerId));
    const res = await capBotAPI.get<ApiResponse<ReviewerAssignmentResponseDTO[]>>(
      `/reviewer-assignments/by-reviewer/${rid}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy assignments theo reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

export interface ReviewerWorkloadDTO {
  reviewerId: IdLike;
  reviewerName?: string;
  email?: string;
  currentActiveAssignments: number;
  completedAssignments?: number;
  pendingAssignments?: number;
  onTimeRate?: number;
  averageScoreGiven?: number;
  workloadScore?: number;
}

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

/** Thống kê workload reviewers */
export const getReviewersWorkload = async (
  semesterId?: IdLike
): Promise<ReviewerWorkloadDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewerWorkloadDTO[]>>(
      `/reviewer-assignments/workload`,
      { params: semesterId != null ? { semesterId } : undefined }
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy thống kê workload reviewer");
    toast.error(msg);
    throw new Error(msg);
  }
};

/** Phân tích matching */
export const analyzeReviewerMatch = async (
  reviewerId: IdLike,
  submissionId: IdLike
): Promise<AnalyzeReviewerMatchDTO> => {
  try {
    const rid = encodeURIComponent(String(reviewerId));
    const sid = encodeURIComponent(String(submissionId));
    const res = await capBotAPI.get<ApiResponse<AnalyzeReviewerMatchDTO>>(
      `/reviewer-assignments/analyze/${rid}/${sid}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể phân tích mức độ phù hợp reviewer");
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

export const getMyAssignments = async (): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewerAssignmentResponseDTO[]>>(
      `/reviewer-assignments/my-assignments`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data ?? [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy danh sách phân công của bạn");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getMyAssignmentsByStatus = async (
  status: AssignmentStatus
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<ReviewerAssignmentResponseDTO[]>>(
      `/reviewer-assignments/my-assignments/by-status/${status}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data ?? [];
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy phân công theo trạng thái");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getMyAssignmentStatistics = async (): Promise<MyAssignmentStatisticsDTO> => {
  try {
    const res = await capBotAPI.get<ApiResponse<MyAssignmentStatisticsDTO>>(
      `/reviewer-assignments/my-assignments/statistics`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data ?? {};
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy thống kê phân công của bạn");
    toast.error(msg);
    throw new Error(msg);
  }
};