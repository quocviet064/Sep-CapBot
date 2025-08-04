import capBotAPI from "@/lib/CapBotApi";
import { SemesterType } from "@/schemas/semesterSchema";
import axios from "axios";
import { toast } from "sonner";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export const fetchAllSemesters = async (): Promise<SemesterType[]> => {
  try {
    const response =
      await capBotAPI.get<ApiResponse<SemesterType[]>>(`/semester/all`);

    const { success, message, data } = response.data;

    if (!success) {
      throw new Error(message || "Failed to fetch semester");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch semester";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};
