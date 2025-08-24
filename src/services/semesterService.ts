import type { AxiosResponse } from "axios";
import axios from "axios";
import { toast } from "sonner";
import capBotAPI from "@/lib/CapBotApi";

export interface CreateSemesterDTO {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface UpdateSemesterDTO extends CreateSemesterDTO {
  id: number;
}

export interface SemesterDTO {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SemesterDetailDTO extends SemesterDTO {
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

type ErrorPayload = { message?: unknown } | string | null;

const getAxiosMessage = (e: unknown, fallback: string): string => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const data = e.response?.data;
    if (typeof data === "string") return data || fallback;
    if (data && typeof data === "object" && "message" in data) {
      const m = (data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return fallback;
};

const BASE = "/semester";

export const createSemester = (
  dto: CreateSemesterDTO,
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.post(`${BASE}/create`, dto);

export const getAllSemesters = (): Promise<
  AxiosResponse<ApiResponse<SemesterDTO[]>>
> => capBotAPI.get(`${BASE}/all`);

export const updateSemester = (
  dto: UpdateSemesterDTO,
): Promise<AxiosResponse<ApiResponse<SemesterDTO>>> =>
  capBotAPI.put(`${BASE}/update`, dto);

export const getSemesterDetail = (
  id: number,
): Promise<AxiosResponse<ApiResponse<SemesterDetailDTO>>> =>
  capBotAPI.get(`${BASE}/detail/${id}`);

export const deleteSemester = (
  id: number,
): Promise<AxiosResponse<ApiResponse<null>>> =>
  capBotAPI.delete(`${BASE}/delete/${id}`);

export const fetchAllSemesters = async (): Promise<SemesterDTO[]> => {
  try {
    const res = await capBotAPI.get<ApiResponse<SemesterDTO[]>>(`${BASE}/all`);
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Failed to fetch semester");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Failed to fetch semester");
    toast.error(msg);
    throw new Error(msg);
  }
};
