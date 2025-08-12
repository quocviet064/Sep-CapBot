import type { AxiosResponse } from "axios";
import axios from "axios";
import { toast } from "sonner";
import { SemesterType } from "@/schemas/semesterSchema";
import capBotAPI from "@/lib/CapBotApi";

// DTO definitions
export interface CreateSemesterDTO {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSemesterDTO extends CreateSemesterDTO {
  id: number;
}

export interface SemesterDTO {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface SemesterDetailDTO extends SemesterDTO {
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

// API response wrapper
interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

// 1. Tạo học kỳ
export const createSemester = (
  dto: CreateSemesterDTO,
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.post("/semester/create", dto);

// 2. Lấy tất cả học kỳ
export const getAllSemesters = (): Promise<
  AxiosResponse<ApiResponse<SemesterDTO[]>>
> => capBotAPI.get("/semester/all");

// 3. Cập nhật học kỳ
export const updateSemester = (
  dto: UpdateSemesterDTO,
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.put("/semester/update", dto);

// 4. Lấy chi tiết 1 học kỳ
export const getSemesterDetail = (
  id: number,
): Promise<AxiosResponse<ApiResponse<SemesterDetailDTO>>> =>
  capBotAPI.get(`/semester/detail/${id}`);

// 5. Xóa học kỳ
export const deleteSemester = (
  id: number,
): Promise<AxiosResponse<ApiResponse<null>>> =>
  capBotAPI.delete(`/semester/delete/${id}`);

// 6. Fetch học kỳ async với toast xử lý lỗi
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
