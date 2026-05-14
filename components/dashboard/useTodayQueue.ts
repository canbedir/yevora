"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type NotificationTone = "focus" | "github" | "notes" | "repo";

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: NotificationTone;
  external?: boolean;
}

interface NotificationResponse {
  items: NotificationItem[];
  count: number;
}

const TODAY_QUEUE_REFRESH_EVENT = "yevora:today-queue:refresh";

export function refreshTodayQueue() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(TODAY_QUEUE_REFRESH_EVENT));
}

export function useTodayQueue() {
  const pathname = usePathname();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading((currentValue) => (items.length === 0 ? true : currentValue));
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
        headers: { "cache-control": "no-store" },
      });
      if (!response.ok) throw new Error("Failed to load notifications");

      const data = (await response.json()) as NotificationResponse;

      setItems(Array.isArray(data.items) ? data.items : []);
      setCount(typeof data.count === "number" ? data.count : 0);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [items.length]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications, pathname]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadNotifications();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    };

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 45000);

    window.addEventListener(TODAY_QUEUE_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(TODAY_QUEUE_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadNotifications]);

  return { items, count, isLoading, hasError, refresh: loadNotifications };
}
