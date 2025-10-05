import api from "@/lib/CapBotApi"; 
import type { AxiosResponse } from "axios";

export type NotificationDTO = {
  id: number;
  userId?: number;
  title?: string;
  body?: string;
  data?: any;
  isRead?: boolean;
  createdAt?: string;
};

export type PagedResult<T> = {
  listObjects: T[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
};

export type GetNotificationsQueryDTO = {
  PageNumber?: number;
  PageSize?: number;
  Keyword?: string | null;
};

export type CreateNotificationDTO = {
  userId: number;
  title: string;
  body: string;
  data?: any;
};

export type CreateBulkNotificationsDTO = {
  userIds: number[];
  title: string;
  body: string;
  data?: any;
};

const basePath = "notifications";

export async function getMyNotifications(query?: GetNotificationsQueryDTO): Promise<PagedResult<NotificationDTO>> {
  const params: Record<string, any> = {};
  if (query?.PageNumber != null) params.PageNumber = query.PageNumber;
  if (query?.PageSize != null) params.PageSize = query.PageSize;
  if (query?.Keyword) params.Keyword = query.Keyword;
  const res: AxiosResponse<any> = await api.get(basePath, { params });
  return res.data?.data ?? res.data;
}

export async function countMyUnreadNotifications(): Promise<number> {
  const res: AxiosResponse<any> = await api.get(`${basePath}/unread-count`);
  const payload = res.data ?? res;
  if (typeof payload === "number") return payload;
  if (payload?.data != null && typeof payload.data === "number") return payload.data;
  if (payload?.unreadCount != null) return payload.unreadCount;
  return Number(payload?.data ?? payload?.unreadCount ?? 0);
}

export async function markNotificationAsRead(notificationId: number): Promise<any> {
  const res: AxiosResponse<any> = await api.put(`${basePath}/${notificationId}/read`);
  return res.data ?? res;
}

export async function markAllNotificationsAsRead(): Promise<any> {
  const res: AxiosResponse<any> = await api.put(`${basePath}/read-all`);
  return res.data ?? res;
}

/* Admin-only */
export async function createNotification(dto: CreateNotificationDTO): Promise<any> {
  const res: AxiosResponse<any> = await api.post(basePath, dto);
  return res.data ?? res;
}

export async function createBulkNotifications(dto: CreateBulkNotificationsDTO): Promise<any> {
  const res: AxiosResponse<any> = await api.post(`${basePath}/bulk`, dto);
  return res.data ?? res;
}

export default {
  getMyNotifications,
  countMyUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  createBulkNotifications,
};
