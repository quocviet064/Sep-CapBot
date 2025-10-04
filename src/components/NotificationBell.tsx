import { useState, useMemo } from "react";
import useNotificationHub from "@/hooks/useNotificationHub";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotification";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";


export default function NotificationBell() {
    useNotificationHub();

    const navigate = useNavigate();
    const { data: unreadCountData } = useUnreadCount();
    const unreadCount = Number(unreadCountData ?? 0);
    const { data: notificationsPage, isLoading } = useNotifications({ PageNumber: 1, PageSize: 12 });
    const markOne = useMarkAsRead();
    const markAll = useMarkAllAsRead();

    const [open, setOpen] = useState(false);

    const notifications = useMemo(() => {
        const list = notificationsPage?.listObjects ?? [];
        return (list || []).slice().sort((a: any, b: any) => {
            const ai = a?.isRead ? 1 : 0;
            const bi = b?.isRead ? 1 : 0;
            if (ai !== bi) return ai - bi;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [notificationsPage]);

    const handleClickNotification = async (n: any) => {
        if (!n) return;
        if (!n.isRead) {
            try {
                await markOne.mutateAsync(Number(n.id));
            } catch {
                /* ignore */
            }
        }

        if (n.relatedEntityType && n.relatedEntityId) {
            const type = String(n.relatedEntityType).toLowerCase();
            if (type === "submission") {
                navigate(`/moderators/submissions/${n.relatedEntityId}`);
            } else if (type === "topic") {
                navigate(`/moderators/topics/${n.relatedEntityId}`);
            }
        }

        setOpen(false);
    };

    return (
        <div className="relative">
            {/* Bell icon */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 rounded-full hover:bg-slate-100"
                title="Thông báo"
            >
                <BellIcon className="w-6 h-6 text-slate-700" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-rose-600 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-[380px] max-h-[520px] overflow-auto bg-white border rounded shadow-lg z-50">
                    {/* Header */}
                    <div className="p-3 border-b flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold">Thông báo</div>
                            <div className="text-xs text-slate-500">{unreadCount} chưa đọc</div>
                        </div>

                        <button
                            onClick={() => markAll.mutateAsync()}
                            className="text-xs text-slate-600 hover:underline"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>

                    {/* List */}
                    {isLoading ? (
                        <div className="p-4 text-sm text-slate-500">Đang tải...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500">Không có thông báo</div>
                    ) : (
                        notifications.map((n: any) => (
                            <div
                                key={n.id}
                                onClick={() => handleClickNotification(n)}
                                className={`p-3 border-b cursor-pointer hover:bg-slate-50 flex items-start gap-2 ${n.isRead ? "bg-white" : "bg-blue-50"
                                    }`}
                            >
                                {/* Dấu chấm đỏ nếu chưa đọc */}
                                {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                                )}

                                {/* Nội dung */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm ${!n.isRead ? "font-semibold text-slate-900" : "text-slate-800"}`}>
                                        {n.title ?? "—"}
                                    </div>
                                    <div className="text-xs text-slate-600 line-clamp-2">{n.message ?? n.body ?? ""}</div>
                                </div>

                                <div className="text-xs text-slate-400 whitespace-nowrap ml-1">
                                    {n.createdAt ? formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) : ""}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Footer */}
                    <div className="p-2 text-xs text-slate-500 text-center border-t">
                        <a href="/notifications" className="underline">
                            Xem tất cả
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
