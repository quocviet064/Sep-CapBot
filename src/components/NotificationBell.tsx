import { useState, useMemo } from "react";
import useNotificationHub from "@/hooks/useNotificationHub";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotification";
import { formatDistanceToNow, parseISO } from "date-fns";
import { BellIcon } from "@heroicons/react/24/outline";
import NotificationDetailModal from "@/components/NotificationDetailModal";

type NotificationItem = {
  id: number;
  title?: string;
  message?: string;
  body?: string;
  isRead?: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  useNotificationHub();

  const { data: unreadCountData } = useUnreadCount();
  const unreadCount = Number(unreadCountData ?? 0);
  const { data: notificationsPage, isLoading } = useNotifications({
    PageNumber: 1,
    PageSize: 12,
  });
  const markOne = useMarkAsRead();
  const markAll = useMarkAllAsRead();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationItem | null>(null);

  const notifications = useMemo<NotificationItem[]>(() => {
    const list = (notificationsPage?.listObjects ?? []) as NotificationItem[];
    return list.slice().sort((a, b) => {
      const ai = a.isRead ? 1 : 0;
      const bi = b.isRead ? 1 : 0;
      if (ai !== bi) return ai - bi;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notificationsPage]);

  const openDetail = async (n: NotificationItem) => {
    if (!n) return;
    setOpen(false);
    if (!n.isRead) {
      try {
        await markOne.mutateAsync(n.id);
      } catch {
        // ignore
      }
    }
    setSelected(n);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 hover:bg-slate-100"
        title="Thông báo"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <BellIcon className="h-9 w-9 text-slate-700" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white"
            aria-label={`${unreadCount} chưa đọc`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-[520px] w-[380px] overflow-auto rounded border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-3">
            <div>
              <div className="text-sm font-semibold">Thông báo</div>
              <div className="text-xs text-slate-500">
                {unreadCount} chưa đọc
              </div>
            </div>
            <button
              onClick={() => markAll.mutateAsync()}
              className="text-xs text-slate-600 hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>

          {isLoading ? (
            <div className="p-4 text-sm text-slate-500">Đang tải...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Không có thông báo</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => openDetail(n)}
                className={`flex cursor-pointer items-start gap-2 border-b p-3 hover:bg-slate-50 ${
                  n.isRead ? "bg-white" : "bg-blue-50"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openDetail(n);
                }}
              >
                {!n.isRead && (
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-rose-500" />
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm ${
                      !n.isRead
                        ? "font-semibold text-slate-900"
                        : "text-slate-800"
                    }`}
                  >
                    {n.title ?? "—"}
                  </div>
                  <div className="line-clamp-2 text-xs text-slate-600">
                    {n.message ?? n.body ?? ""}
                  </div>
                </div>
                <div className="ml-1 text-xs whitespace-nowrap text-slate-400">
                  {n.createdAt
                    ? formatDistanceToNow(parseISO(n.createdAt), {
                        addSuffix: true,
                      })
                    : ""}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <NotificationDetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        notification={selected}
        autoMarkRead={false}
      />
    </div>
  );
}
