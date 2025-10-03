import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export interface ApiResponse<T> {
  statusCode: string;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export type ProficiencyLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert"
  | string;

export interface LecturerSkill {
  id: number;
  lecturerId: number;
  skillTag: string;
  proficiencyLevel: ProficiencyLevel;
  proficiencyLevelName: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export interface CreateLecturerSkillPayload {
  lecturerId: number;
  skillTag: string;
  proficiencyLevel: ProficiencyLevel;
}

export interface UpdateLecturerSkillPayload {
  id: number;
  skillTag: string;
  proficiencyLevel: ProficiencyLevel;
}

export interface PagingData {
  pageNumber: number;
  pageSize: number;
  keyword: string | null;
  totalRecord: number;
}

export interface LecturerSkillListResponse {
  paging: PagingData;
  listObjects: LecturerSkill[];
}

export const createLecturerSkill = async (
  payload: CreateLecturerSkillPayload,
): Promise<LecturerSkill> => {
  try {
    const res = await capBotAPI.post<ApiResponse<LecturerSkill>>(
      "/lecturer-skills",
      payload,
    );
    const { success, data, message } = res.data;
    if (!success) throw new Error(message || "Tạo kỹ năng thất bại");
    toast.success(message || "Tạo kỹ năng thành công");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Tạo kỹ năng thất bại"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const updateLecturerSkill = async (
  payload: UpdateLecturerSkillPayload,
): Promise<LecturerSkill> => {
  try {
    const res = await capBotAPI.put<ApiResponse<LecturerSkill>>(
      "/lecturer-skills",
      payload,
    );
    const { success, data } = res.data;
    if (!success) throw new Error("Cập nhật kỹ năng thất bại");
    return data;
  } catch {
    throw new Error("Cập nhật kỹ năng thất bại");
  }
};

export const fetchLecturerSkills = async (
  lecturerId: number,
  pageNumber: number,
  pageSize: number,
  keyword?: string,
): Promise<LecturerSkillListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<LecturerSkillListResponse>>(
      "/lecturer-skills",
      {
        params: {
          lecturerId,
          PageNumber: pageNumber,
          PageSize: pageSize,
          Keyword: keyword,
        },
      },
    );
    const { success, data, message } = res.data;
    if (!success) throw new Error(message || "Không thể lấy danh sách kỹ năng");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy danh sách kỹ năng"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchMyLecturerSkills = async (
  pageNumber: number,
  pageSize: number,
  keyword?: string,
): Promise<LecturerSkillListResponse> => {
  try {
    const res = await capBotAPI.get<ApiResponse<LecturerSkillListResponse>>(
      "/lecturer-skills/me",
      {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          Keyword: keyword,
        },
      },
    );
    const { success, data, message } = res.data;
    if (!success) throw new Error(message || "Không thể lấy kỹ năng của bạn");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy kỹ năng của bạn"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getLecturerSkill = async (id: number): Promise<LecturerSkill> => {
  try {
    const res = await capBotAPI.get<ApiResponse<LecturerSkill>>(
      `/lecturer-skills/${id}`,
    );
    const { success, data, message } = res.data;
    if (!success) throw new Error(message || "Không thể lấy chi tiết kỹ năng");
    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy chi tiết kỹ năng"
      : "Lỗi không xác định";
    toast.error(msg);
    throw new Error(msg);
  }
};

export const deleteLecturerSkill = async (id: number): Promise<void> => {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/lecturer-skills/${id}`,
    );
    const { success } = res.data;
    if (!success) throw new Error("Xóa kỹ năng thất bại");
  } catch {
    throw new Error("Xóa kỹ năng thất bại");
  }
};

export interface BulkUpdateResult {
  ok: LecturerSkill[];
  failed: Array<{
    item: UpdateLecturerSkillPayload;
    status?: number;
    message: string;
  }>;
}

export const bulkUpdateLecturerSkills = async (
  items: UpdateLecturerSkillPayload[],
): Promise<BulkUpdateResult> => {
  const results = await Promise.allSettled(
    items.map((p) => updateLecturerSkill(p)),
  );

  const ok: LecturerSkill[] = [];
  const failed: BulkUpdateResult["failed"] = [];

  results.forEach((r, i) => {
    const item = items[i];
    if (r.status === "fulfilled") {
      ok.push(r.value);
    } else {
      const err = r.reason;
      const isAxios = axios.isAxiosError(err);
      failed.push({
        item,
        status: isAxios ? err.response?.status : undefined,
        message:
          (isAxios && (err.response?.data?.message as string)) ||
          err?.message ||
          "Cập nhật thất bại",
      });
    }
  });

  return { ok, failed };
};
