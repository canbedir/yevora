"use client";

import { useEffect, useState } from "react";

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

export function useTodayQueue() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load notifications");

        const data = (await response.json()) as NotificationResponse;
        if (!isMounted) return;

        setItems(Array.isArray(data.items) ? data.items : []);
        setCount(typeof data.count === "number" ? data.count : 0);
        setHasError(false);
      } catch {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, count, isLoading, hasError };
}
