// services/topicUpdateService.ts
import capBotAPI from "@/lib/CapBotApi";
import { toast } from "sonner";
import axios from "axios";

export interface UpdateTopicPayload {
  id: number;
  title: string;
  description: string;
  objectives: string;
  categoryId: number;
  maxStudents: number;
}

export interface UpdateTopicResponse {
  id: number;
  title: string;
  description: string;
  supervisorName: string;
  categoryName: string;
  semesterName: string;
  maxStudents: number;
  isApproved: boolean;
  updatedAt: string;
  updatedBy: string;
  currentVersionNumber: number;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export const updateTopic = async (
  payload: UpdateTopicPayload,
): Promise<UpdateTopicResponse> => {
  try {
    const response = await capBotAPI.put<ApiResponse<UpdateTopicResponse>>(
      "/topic/update",
      payload,
    );

    const { success, message, data } = response.data;

    if (!success) {
      throw new Error(message || "Cập nhật đề tài thất bại");
    }

    toast.success("🎉 Cập nhật đề tài thành công!");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Cập nhật đề tài thất bại";

      throw new Error(errorMessage);
    }

    toast.error("🛑 Đã xảy ra lỗi không xác định");
    throw new Error("Unknown error");
  }
};
