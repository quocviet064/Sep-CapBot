import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { HubConnection } from "@microsoft/signalr";
import {
  createNotificationHubConnection,
  connectNotificationHub,
  disconnectNotificationHub,
  getNotificationHubConnection,
} from "@/services/notificationHub";
import type { NotificationDTO } from "@/services/notificationService";

const NOTIFICATIONS_KEY = ["notifications"] as const;
const NOTIF_UNREAD_COUNT_KEY = ["notifications-unread-count"] as const;

export default function useNotificationHub() {
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const connRef = useRef<HubConnection | null>(null);

  const handleNotification = useCallback((noti: NotificationDTO) => {
    try {
      qc.setQueryData(NOTIFICATIONS_KEY as readonly unknown[], (old: any) => {
        if (!old) {
          return { listObjects: [noti], totalRecords: 1, pageNumber: 1, pageSize: 20 };
        }
        const next = { ...old } as any;
        const arr = Array.isArray(next.listObjects) ? next.listObjects.slice() : [];
        // Put new notification at top
        arr.unshift(noti);
        next.listObjects = arr;
        if (typeof next.totalRecords === "number") next.totalRecords = next.totalRecords + 1;
        return next;
      });
      qc.setQueryData(NOTIF_UNREAD_COUNT_KEY as readonly unknown[], (old: any) => {
        const prev = typeof old === "number" ? old : Number(old ?? 0);
        return prev + (noti.isRead ? 0 : 1);
      });
    } catch (err) {
      console.warn("notificationHub: handleNotification error", err);
    }
  }, [qc]);

  const handleUnreadCount = useCallback((count: number) => {
    try {
      qc.setQueryData(NOTIF_UNREAD_COUNT_KEY as readonly unknown[], Number(count ?? 0));
    } catch (err) {
      console.warn("notificationHub: handleUnreadCount error", err);
    }
  }, [qc]);

  const handleMarkedAsRead = useCallback((notificationId: number) => {
    // update single notification isRead flag in cached list; decrease unread count
    try {
      qc.setQueryData(NOTIFICATIONS_KEY as readonly unknown[], (old: any) => {
        if (!old) return old;
        const next = { ...old } as any;
        next.listObjects = (next.listObjects || []).map((n: any) =>
          Number(n.id) === Number(notificationId) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        );
        return next;
      });

      qc.setQueryData(NOTIF_UNREAD_COUNT_KEY as readonly unknown[], (old: any) => {
        const prev = typeof old === "number" ? old : Number(old ?? 0);
        return Math.max(0, prev - 1);
      });
    } catch (err) {
      console.warn("notificationHub: handleMarkedAsRead error", err);
    }
  }, [qc]);

  const handleAllMarkedAsRead = useCallback(() => {
    try {
      qc.setQueryData(NOTIFICATIONS_KEY as readonly unknown[], (old: any) => {
        if (!old) return old;
        const next = { ...old } as any;
        next.listObjects = (next.listObjects || []).map((n: any) => ({ ...n, isRead: true, readAt: new Date().toISOString() }));
        return next;
      });

      qc.setQueryData(NOTIF_UNREAD_COUNT_KEY as readonly unknown[], 0);
    } catch (err) {
      console.warn("notificationHub: handleAllMarkedAsRead error", err);
    }
  }, [qc]);

  useEffect(() => {
    let mounted = true;
    const conn = createNotificationHubConnection();
    connRef.current = conn;

    const onOpen = async () => {
      try {
        await connectNotificationHub();
        if (!mounted) return;
        setConnected(true);
      } catch (err) {
        setConnected(false);
        console.warn("notificationHub connect failed", err);
      }
    };

    onOpen();
    conn.on("notification", (payload: NotificationDTO) => {
      handleNotification(payload);
    });

    conn.on("notificationUnreadCount", (count: number) => {
      handleUnreadCount(Number(count ?? 0));
    });

    conn.on("notificationMarkedAsRead", (id: number) => {
      handleMarkedAsRead(Number(id));
    });

    conn.on("notificationAllMarkedAsRead", () => {
      handleAllMarkedAsRead();
    });

    conn.on("notificationBulkCreated", () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY as readonly unknown[] });
      qc.invalidateQueries({ queryKey: NOTIF_UNREAD_COUNT_KEY as readonly unknown[] });
    });
    return () => {
      mounted = false;
      try {
        conn.off("notification");
        conn.off("notificationUnreadCount");
        conn.off("notificationMarkedAsRead");
        conn.off("notificationAllMarkedAsRead");
        conn.off("notificationBulkCreated");
      } catch {}
    };
  }, [qc, handleNotification, handleUnreadCount, handleMarkedAsRead, handleAllMarkedAsRead]);

  const connect = useCallback(async () => {
    try {
      const c = getNotificationHubConnection() ?? createNotificationHubConnection();
      await c.start();
      setConnected(true);
      return c;
    } catch (err) {
      setConnected(false);
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await disconnectNotificationHub();
      setConnected(false);
    } catch {
      setConnected(false);
    }
  }, []);

  return {
    connected,
    connect,
    disconnect,
    connection: connRef.current,
  };
}
