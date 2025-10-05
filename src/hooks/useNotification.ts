import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
    GetNotificationsQueryDTO,
    NotificationDTO,
    CreateNotificationDTO,
    CreateBulkNotificationsDTO,
    PagedResult,
} from "@/services/notificationService";
import * as notificationService from "@/services/notificationService";

const NOTIFICATIONS_KEY = ["notifications"] as const;
const NOTIF_UNREAD_COUNT_KEY = ["notifications-unread-count"] as const;

export function useNotifications(query?: GetNotificationsQueryDTO) {
    return useQuery<PagedResult<NotificationDTO>, Error>({
        queryKey: [...NOTIFICATIONS_KEY, query ?? {}] as readonly unknown[],
        queryFn: async () => {
            return await notificationService.getMyNotifications(query);
        },
        staleTime: 1000 * 30,
        retry: 1,
    });
}

/** unread count */
export function useUnreadCount() {
    return useQuery<number, Error>({
        queryKey: NOTIF_UNREAD_COUNT_KEY,
        queryFn: async () => {
            return await notificationService.countMyUnreadNotifications();
        },
        staleTime: 1000 * 10,
        refetchInterval: false,
    });
}

/** mark one as read */
export function useMarkAsRead() {
    const qc = useQueryClient();
    return useMutation<any, Error, number>({
        mutationFn: async (id: number) => notificationService.markNotificationAsRead(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY as readonly unknown[] });
            qc.invalidateQueries({ queryKey: NOTIF_UNREAD_COUNT_KEY as readonly unknown[] });
            toast.success("Đã đánh dấu là đã đọc");
        },
        onError: (err: any) => {
            toast.error(err?.message ?? "Không thể đánh dấu thông báo");
        },
    });
}

/** mark all as read */
export function useMarkAllAsRead() {
    const qc = useQueryClient();
    return useMutation<any, Error, void>({
        mutationFn: async () => notificationService.markAllNotificationsAsRead(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY as readonly unknown[] });
            qc.invalidateQueries({ queryKey: NOTIF_UNREAD_COUNT_KEY as readonly unknown[] });
            toast.success("Đã đánh dấu toàn bộ thông báo là đã đọc");
        },
    });
}

/** admin: create one notification */
export function useCreateNotification() {
    const qc = useQueryClient();
    return useMutation<any, Error, CreateNotificationDTO>({
        mutationFn: async (payload: CreateNotificationDTO) => notificationService.createNotification(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY as readonly unknown[] });
            toast.success("Tạo thông báo thành công");
        },
        onError: (err: any) => {
            toast.error(err?.message ?? "Tạo thông báo thất bại");
        },
    });
}

/** admin: create bulk notifications */
export function useCreateBulkNotifications() {
    const qc = useQueryClient();
    return useMutation<any, Error, CreateBulkNotificationsDTO>({
        mutationFn: async (payload: CreateBulkNotificationsDTO) => notificationService.createBulkNotifications(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY as readonly unknown[] });
            toast.success("Tạo hàng loạt thông báo thành công");
        },
        onError: (err: any) => {
            toast.error(err?.message ?? "Tạo thông báo hàng loạt thất bại");
        },
    });
}
