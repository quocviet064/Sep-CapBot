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

export const createCategory = async (data: { name: string; description?: string }) => {
  try {
    const response = await capBotAPI.post<ApiResponse<CategoryType>>(`/topic-category/create`, data);
    if (!response.data.success) throw new Error(response.data.message || "Tạo mới thất bại");
    toast.success("Tạo danh mục thành công!");
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Tạo danh mục thất bại";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};

export const updateCategory = async (data: { id: number; name: string; description?: string }) => {
  try {
    const response = await capBotAPI.put<ApiResponse<CategoryType>>(`/topic-category/update`, data);
    if (!response.data.success) throw new Error(response.data.message || "Cập nhật thất bại");
    toast.success("Cập nhật danh mục thành công!");
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Cập nhật danh mục thất bại";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const response = await capBotAPI.delete<ApiResponse<any>>(`/topic-category/delete/${id}`);
    if (!response.data.success) throw new Error(response.data.message || "Xoá thất bại");
    toast.success("Xoá danh mục thành công!");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Xoá danh mục thất bại";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error("An unknown error occurred");
    throw new Error("An unknown error occurred");
  }
};