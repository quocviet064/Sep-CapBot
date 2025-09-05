import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";
import { CategoryType, CategoryDetailType } from "@/schemas/categorySchema";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  description: string;
}

export const createCategory = async (
  payload: CreateCategoryPayload,
): Promise<void> => {
  try {
    const response = await capBotAPI.post<ApiResponse<null>>(
      "/topic-category/create",
      payload,
    );

    const { success, message } = response.data;

    if (!success) throw new Error(message || "Tạo danh mục thất bại");
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Tạo danh mục thất bại"
      : "Lỗi không xác định";

    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchAllCategories = async (): Promise<CategoryType[]> => {
  try {
    const response = await capBotAPI.get<ApiResponse<CategoryType[]>>(
      "/topic-category/all",
    );

    const { success, message, data } = response.data;

    if (!success) throw new Error(message || "Không thể tải danh mục");

    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể tải danh mục"
      : "Lỗi không xác định";

    toast.error(msg);
    throw new Error(msg);
  }
};

export const fetchCategoryById = async (
  topicCategoryId: string,
): Promise<CategoryDetailType> => {
  try {
    const response = await capBotAPI.get<ApiResponse<CategoryDetailType>>(
      `/topic-category/detail/${topicCategoryId}`,
    );

    const { success, message, data } = response.data;

    if (!success) throw new Error(message || "Không thể lấy chi tiết danh mục");

    return data;
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy chi tiết danh mục"
      : "Lỗi không xác định";

    toast.error(msg);
    throw new Error(msg);
  }
};

export interface UpdateCategoryPayload {
  id: number;
  name: string;
  description: string;
}

export const updateCategory = async (
  payload: UpdateCategoryPayload,
): Promise<void> => {
  try {
    const response = await capBotAPI.put<ApiResponse<null>>(
      "/topic-category/update",
      payload,
    );

    const { success, message } = response.data;

    if (!success) throw new Error(message || "Cập nhật danh mục thất bại");

    toast.success("🎉 Cập nhật danh mục thành công!");
  } catch (error) {
    const msg = axios.isAxiosError(error)
      ? error.response?.data?.message || "Cập nhật danh mục thất bại"
      : "Lỗi không xác định";

    toast.error(msg);
    throw new Error(msg);
  }
};

export const deleteCategoryById = async (id: number): Promise<void> => {
  try {
    const response = await capBotAPI.delete<ApiResponse<null>>(
      `/topic-category/delete/${id}`,
    );

    const { success, message } = response.data;

    if (!success) throw new Error(message || "Xóa danh mục thất bại");

    toast.success("🗑️ Xóa danh mục thành công!");
  } catch (error) {
    let msg = "Lỗi không xác định";
    if (axios.isAxiosError(error)) {
      const res = error.response;
      if (res?.status === 409) {
        msg =
          res.data?.message || "Không thể xóa danh mục vì đang được sử dụng.";
      } else {
        msg = res?.data?.message || "Không thể xóa danh mục";
      }
    }

    throw new Error(msg);
  }
};
