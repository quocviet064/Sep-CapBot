import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export interface TopicDetailResponse {
  id: number;
  title: string;
  description: string;
  objectives: string;
  supervisorId: number;
  supervisorName: string;
  categoryId: number;
  categoryName: string;
  semesterId: number;
  semesterName: string;
  maxStudents: number;
  isApproved: boolean;
  isLegacy: boolean;
  currentStatus: number;
  totalVersions: number;
  currentVersion: {
    id: number;
    topicId: number;
    versionNumber: number;
    title: string;
    description: string;
    objectives: string;
    methodology: string;
    expectedOutcomes: string;
    requirements: string;
    documentUrl: string;
    status: number;
    submittedAt: string | null;
    submittedByUserName: string | null;
    createdAt: string;
    createdBy: string;
    lastModifiedAt: string | null;
    lastModifiedBy: string | null;
  };
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export const getTopicDetail = async (
  topicId: number,
): Promise<TopicDetailResponse> => {
  try {
    const response = await capBotAPI.get(`/topic/detail/${topicId}`);
    const { success, data, message } = response.data;

    if (!success) {
      throw new Error(message || "Không thể lấy chi tiết đề tài");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Không thể lấy chi tiết đề tài";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.error("Lỗi không xác định");
    throw new Error("Lỗi không xác định");
  }
};
