import capBotAPI from "@/lib/CapBotApi";
import axios from "axios";
import { toast } from "sonner";

export interface ApiResponse<T> {
  statusCode: string | number;
  success: boolean;
  data: T;
  errors?: unknown;
  message: string | null;
}

export type UserRole = {
  id: number;
  roleName: string;
};

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

export async function fetchUserRoles(userId: number): Promise<UserRole[]> {
  try {
    const res = await capBotAPI.get<ApiResponse<UserRole[]>>(
      `/Account/user-roles/${userId}`,
    );
    const { success, data, message } = res.data;
    if (!success) throw new Error(message || "Không thể lấy danh sách quyền");
    return data;
  } catch (e) {
    const msg = getAxiosMessage(e, "Không thể lấy danh sách quyền");
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function addRolesToUser(
  userId: number,
  roles: string[],
): Promise<void> {
  try {
    const res = await capBotAPI.post<ApiResponse<unknown>>(
      `/Account/user-roles/${userId}`,
      roles,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Thêm quyền thất bại");
    toast.success(message || "Thêm roles thành công");
  } catch (e) {
    const msg = getAxiosMessage(e, "Thêm roles thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
}

export async function deleteRolesFromUser(
  userId: number,
  roles: string[],
): Promise<void> {
  try {
    const res = await capBotAPI.delete<ApiResponse<unknown>>(
      `/Account/user-roles/${userId}`,
      { data: roles },
    );
    const { success, message } = res.data;
    if (!success) throw new Error(message || "Xoá quyền thất bại");
    toast.success(message || "Xoá roles thành công");
  } catch (e) {
    const msg = getAxiosMessage(e, "Xoá roles thất bại");
    toast.error(msg);
    throw new Error(msg);
  }
}
