import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export interface ApiResponse<T> {
  statusCode: string | number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export interface UserProfile {
  id: number;
  userId: number;
  fullName: string;
  address: string | null;
  avatar: string | null;
  coverImage: string | null;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string | null;
  lastModifiedBy: string | null;
}

export interface CreateUserProfilePayload {
  userId: number;
  fullName: string;
  address?: string;
  avatar?: string;
  coverImage?: string;
}

export interface UpdateUserProfilePayload {
  id: number;
  fullName?: string;
  address?: string;
  avatar?: string;
  coverImage?: string;
}

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(e)) {
    const data = e.response?.data;
    if (typeof data === "string") return data || fallback;
    if (data && typeof data === "object" && "message" in data) {
      return (data as { message?: string }).message || fallback;
    }
  }
  return fallback;
};

export const createUserProfile = async (
  payload: CreateUserProfilePayload,
): Promise<UserProfile> => {
  try {
    const res = await capBotAPI.post<ApiResponse<UserProfile>>(
      "/user-profiles",
      payload,
      {
        headers: {
          "Content-Type":
            "application/json;odata.metadata=minimal;odata.streaming=true",
        },
      },
    );
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Tạo hồ sơ thất bại");
    toast.success("Tạo hồ sơ thành công");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Tạo hồ sơ thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const updateUserProfile = async (
  payload: UpdateUserProfilePayload,
): Promise<UserProfile> => {
  try {
    const res = await capBotAPI.put<ApiResponse<UserProfile>>(
      "/user-profiles",
      payload,
      {
        headers: {
          "Content-Type":
            "application/json;odata.metadata=minimal;odata.streaming=true",
        },
      },
    );
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Cập nhật hồ sơ thất bại");
    toast.success("Cập nhật hồ sơ thành công");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Cập nhật hồ sơ thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const deleteUserProfile = async (id: number): Promise<void> => {
  try {
    const res = await capBotAPI.delete<ApiResponse<null>>(
      `/user-profiles/${id}`,
    );
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Xóa hồ sơ thất bại");
    toast.success("🗑️ Xóa hồ sơ thành công");
  } catch (e) {
    const msg = getAxiosMessage(e, "Xóa hồ sơ thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getUserProfileById = async (id: number): Promise<UserProfile> => {
  try {
    const res = await capBotAPI.get<ApiResponse<UserProfile>>(
      `/user-profiles/${id}`,
    );
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Không thể lấy hồ sơ");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy hồ sơ");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getUserProfileByUserId = async (
  userId: number,
): Promise<UserProfile> => {
  try {
    const res = await capBotAPI.get<ApiResponse<UserProfile>>(
      `/user-profiles/by-user/${userId}`,
    );
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Không thể lấy hồ sơ theo UserId");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy hồ sơ theo UserId");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const getMyUserProfile = async (): Promise<UserProfile> => {
  try {
    const res =
      await capBotAPI.get<ApiResponse<UserProfile>>("/user-profiles/me");
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || "Không thể lấy hồ sơ của tôi");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy hồ sơ của tôi");
    toast.error(msg);
    throw new Error(msg);
  }
};

export const tryGetMyUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const res =
      await capBotAPI.get<ApiResponse<UserProfile>>("/user-profiles/me");
    if (res.data?.success && res.data?.data) return res.data.data;
    return null;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
};
