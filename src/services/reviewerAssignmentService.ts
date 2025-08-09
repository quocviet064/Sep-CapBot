import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

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
  submissionId: number;
  reviewerId: number;
  assignmentType: AssignmentTypes;
  deadline?: string;
  skillMatchScore?: number;
  notes?: string;
}

export interface BulkAssignReviewerDTO {
  assignments: AssignReviewerDTO[];
}

export interface AutoAssignReviewerDTO {
  submissionId: number;
  maxWorkload?: number;
  prioritizeHighPerformance?: boolean;
  topicSkillTags?: string[];
}

export interface AvailableReviewerDTO {
  id: number;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  currentAssignments: number;
  completedAssignments: number;
  averageScoreGiven?: number;
  onTimeRate?: number;
  qualityRating?: number;
  skills: string[];
  skillMatchScore?: number;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface ReviewerAssignmentResponseDTO {
  id: number;
  submissionId: number;
  reviewerId: number;
  assignedBy: number;
  assignmentType: AssignmentTypes;
  skillMatchScore?: number;
  deadline?: string;
  status: AssignmentStatus;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  reviewer?: { id: number; userName: string };
  assignedByUser?: { id: number; userName: string };
  submissionTitle?: string;
  topicTitle?: string;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

/* Phân công 1 reviewer */
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
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Không thể phân công reviewer"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

/* Phân công hàng loạt */
export const bulkAssignReviewers = async (
  payload: BulkAssignReviewerDTO
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.post<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >("/reviewer-assignments/bulk", payload);
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Bulk assign thành công");
    return res.data.data;
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Bulk assign thất bại"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

/* Lấy danh sách reviewer có thể phân công */
export const getAvailableReviewers = async (
  submissionId: number
): Promise<AvailableReviewerDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<AvailableReviewerDTO[]>>(
      `/reviewer-assignments/available/${submissionId}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Không thể lấy reviewer"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

/* Lấy assignments của 1 submission */
export const getAssignmentsBySubmission = async (
  submissionId: number
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.get<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >(`/reviewer-assignments/by-submission/${submissionId}`);
    if (!res.data.success) throw new Error(res.data.message || "");
    return res.data.data;
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Không thể lấy assignments"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

/* Cập nhật trạng thái assignment */
export const updateAssignmentStatus = async (
  assignmentId: number,
  status: AssignmentStatus
): Promise<void> => {
  try {
    const res = await capBotAPI.put<ApiResponse<null>>(
      `/reviewer-assignments/${assignmentId}/status`,
      status
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Cập nhật status thành công");
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Cập nhật status thất bại"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

/* Hủy assignment */
export const cancelAssignment = async (
  assignmentId: number
): Promise<void> => {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/reviewer-assignments/${assignmentId}`
    );
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Hủy assignment thành công");
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Hủy assignment thất bại"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

/* Tự động phân công */
export const autoAssignReviewers = async (
  payload: AutoAssignReviewerDTO
): Promise<ReviewerAssignmentResponseDTO[]> => {
  try {
    const res = await capBotAPI.post<
      ApiResponse<ReviewerAssignmentResponseDTO[]>
    >("/reviewer-assignments/auto-assign", payload);
    if (!res.data.success) throw new Error(res.data.message || "");
    toast.success("Auto assign thành công");
    return res.data.data;
  } catch (e: any) {
    const msg =
      axios.isAxiosError(e)
        ? e.response?.data?.message || "Auto assign thất bại"
        : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};
