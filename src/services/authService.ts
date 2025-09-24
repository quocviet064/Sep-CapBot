import capBotAPI from "@/lib/CapBotApi";
import axios, { AxiosError } from "axios";

type ErrorPayload = { message?: string | null } | string | null | undefined;

const getAxiosMessage = (e: unknown, fallback: string) => {
  if (axios.isAxiosError<ErrorPayload>(e)) {
    const err = e as AxiosError<ErrorPayload>;
    const data = err.response?.data;
    if (typeof data === "string") return data || fallback;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: string | null }).message;
      if (typeof msg === "string") return msg || fallback;
    }
    return err.message || fallback;
  }
  return fallback;
};

export type AdminCreatableRole = "Reviewer" | "Moderator" | "Supervisor";

export interface RegisterUserDTO {
  email: string;
  phoneNumber?: string | null;
  userName: string;
  password: string;
  confirmPassword: string;
  role: AdminCreatableRole;
}

export async function registerUser(payload: RegisterUserDTO): Promise<void> {
  try {
    await capBotAPI.post("/auth/register", payload);
  } catch (e: unknown) {
    throw new Error(getAxiosMessage(e, "Không thể tạo tài khoản"));
  }
}

export interface ApiEnvelope<T> {
  statusCode: string | number;
  success: boolean;
  data: T;
  errors: unknown;
  message: string | null;
}

export interface UserOverviewRoleDTO {
  id: number;
  name: string;
}

export interface UserDTO {
  id: number;
  email: string;
  userName: string;
  phoneNumber: string | null;
  roleInUserOverviewDTOs: UserOverviewRoleDTO[];
  createdAt: string;
}

export interface UsersPageDTO<TItem> {
  paging: {
    pageNumber: number;
    pageSize: number;
    keyword: string | null;
    totalRecord: number;
  };
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  listObjects: TItem[];
}

export type GetUsersQuery = {
  PageNumber?: number;
  PageSize?: number;
  Keyword?: string;
  TotalRecord?: number;
};

export async function fetchUsers(
  args: GetUsersQuery,
): Promise<UsersPageDTO<UserDTO>> {
  const { PageNumber = 1, PageSize = 10, Keyword, TotalRecord } = args ?? {};
  try {
    const params: Record<string, unknown> = {
      PageNumber,
      PageSize,
      Keyword,
      TotalRecord,
    };
    const res = await capBotAPI.get<ApiEnvelope<UsersPageDTO<UserDTO>>>(
      "/Account/users",
      { params },
    );
    if (!res.data?.success)
      throw new Error(
        res.data?.message || "Không lấy được danh sách người dùng",
      );
    return res.data.data;
  } catch (e) {
    throw new Error(getAxiosMessage(e, "Không lấy được danh sách người dùng"));
  }
}

export async function deleteUser(userId: number | string): Promise<void> {
  try {
    await capBotAPI.delete(
      `/Account/users/${encodeURIComponent(String(userId))}`,
    );
  } catch (e) {
    throw new Error(getAxiosMessage(e, "Không thể xoá người dùng"));
  }
}
