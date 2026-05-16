/**
 * hooks/useNotifications.ts
 */

import { useState, useEffect, useCallback } from "react";
import {
  fetchNotifications,
  fetchPriorityNotifications,
  Notification,
  NotificationType,
} from "../api/notifications";
import { markAsViewed, isViewed } from "../state/notificationStore";
import { logger } from "../utils/logger";

export type FilterType = NotificationType | "All";

interface UseNotificationsOptions {
  filterType?: FilterType;
  limit?: number;
  page?: number;
}

interface UseNotificationsResult {
  notifications: (Notification & { viewed: boolean })[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  handleView: (id: string) => void;
}

export function useNotifications({
  filterType = "All",
  limit = 20,
  page = 1,
}: UseNotificationsOptions = {}): UseNotificationsResult {
  const [notifications, setNotifications] = useState<(Notification & { viewed: boolean })[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    await logger.info("hook", `useNotifications loading: page=${page} limit=${limit} filter=${filterType}`);

    try {
      const type = filterType === "All" ? undefined : filterType;
      const data = await fetchNotifications(limit, page, type);

      const enriched = data.notifications.map((n) => ({
        ...n,
        viewed: isViewed(n.ID),
      }));

      setNotifications(enriched);
      setTotal(data.total);
      setTotalPages(data.totalPages);

      await logger.info("hook", `useNotifications loaded ${enriched.length} notifications`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      await logger.error("hook", `useNotifications error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [filterType, limit, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleView = useCallback((id: string) => {
    markAsViewed(id);
    setNotifications((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, viewed: true } : n))
    );
  }, []);

  return { notifications, total, totalPages, loading, error, refetch: load, handleView };
}

// ─── Priority Inbox hook ──────────────────────────────────────────────────────

interface UsePriorityResult {
  notifications: (Notification & { viewed: boolean })[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  handleView: (id: string) => void;
}

export function usePriorityNotifications(topN: number = 10): UsePriorityResult {
  const [notifications, setNotifications] = useState<(Notification & { viewed: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    await logger.info("hook", `usePriorityNotifications loading top ${topN}`);

    try {
      const data = await fetchPriorityNotifications(topN);
      const enriched = data.map((n) => ({ ...n, viewed: isViewed(n.ID) }));
      setNotifications(enriched);
      await logger.info("hook", `usePriorityNotifications loaded ${enriched.length} items`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      await logger.error("hook", `usePriorityNotifications error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [topN]);

  useEffect(() => {
    load();
  }, [load]);

  const handleView = useCallback((id: string) => {
    markAsViewed(id);
    setNotifications((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, viewed: true } : n))
    );
  }, []);

  return { notifications, loading, error, refetch: load, handleView };
}
