import capBotAPI from "@/lib/CapBotApi";
import type { AxiosResponse } from "axios";

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

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: any;
  message: string | null;
}

// 1. Tạo học kỳ
export const createSemester = (
  dto: CreateSemesterDTO
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.post("/semester/create", dto);

// 2. Lấy tất cả học kỳ
export const getAllSemesters = (): Promise<
  AxiosResponse<ApiResponse<SemesterDTO[]>>
> => capBotAPI.get("/semester/all");

// 3. Cập nhật học kỳ
export const updateSemester = (
  dto: UpdateSemesterDTO
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.put("/semester/update", dto);

// 4. Lấy chi tiết 1 học kỳ
export const getSemesterDetail = (
  id: number
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.get(`/semester/detail/${id}`);

// 5. Xóa học kỳ
export const deleteSemester = (
  id: number
): Promise<AxiosResponse<ApiResponse<null>>> =>
  capBotAPI.delete(`/semester/delete/${id}`);
