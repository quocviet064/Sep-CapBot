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
