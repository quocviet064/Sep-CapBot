import capBotAPI from "@/lib/CapBotApi";
import { CategoryDetailType, CategoryType } from "@/schemas/categorySchema";
import axios from "axios";
import { toast } from "sonner";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export const fetchAllCategories = async (): Promise<CategoryType[]> => {
  try {
    const response =
      await capBotAPI.get<ApiResponse<CategoryType[]>>(`/topic-category/all`);

    const { success, message, data } = response.data;

    if (!success) {
      throw new Error(message || "Failed to fetch category");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch category";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};

export const fetchCategoryById = async (
  topicCategoryId: string,
): Promise<CategoryDetailType> => {
  try {
    const response = await capBotAPI.get(
      `/topic-category/detail/${topicCategoryId}`,
    );

    const { success, message, data } = response.data;

    if (!success) {
      throw new Error(message || "Failed to fetch topic category");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch topic category";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};
