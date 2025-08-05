import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export const approveTopic = async (
  topicId: number | string,
): Promise<void> => {
  try {
    const response = await capBotAPI.post<ApiResponse<null>>(
      `/topic/approve/${topicId}`
    );
    const { success, message } = response.data;
    if (!success) {
      throw new Error(message || "Phê duyệt đề tài thất bại");
    }
    toast.success("Phê duyệt đề tài thành công");
  } catch (error) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Phê duyệt đề tài thất bại"
      : "Lỗi không xác định";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
