/**
 * api/notifications.ts
 *
 * Axios-based API calls to the notification_app_be backend.
 */

import axios from "axios";
import { logger } from "../utils/logger";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface PaginatedResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fetch all notifications (optional filter by type)
export async function fetchNotifications(
  limit?: number,
  page?: number,
  notification_type?: string
): Promise<PaginatedResponse> {
  await logger.info("api", `fetchNotifications called: page=${page} limit=${limit} type=${notification_type ?? "all"}`);

  const params: Record<string, string | number> = {};
  if (limit !== undefined) params.limit = limit;
  if (page !== undefined) params.page = page;
  if (notification_type) params.notification_type = notification_type;

  try {
    const res = await axios.get<PaginatedResponse | { notifications: Notification[] }>(
      `${API_BASE}/notifications`,
      { params, timeout: 10000 }
    );

    await logger.info("api", `fetchNotifications succeeded`);

    // Normalise response shape
    const data = res.data as PaginatedResponse;
    if (data.totalPages === undefined) {
      const all = (res.data as { notifications: Notification[] }).notifications ?? [];
      return { notifications: all, total: all.length, page: 1, limit: all.length, totalPages: 1 };
    }
    return data;
  } catch (err: unknown) {
    await logger.error("api", `fetchNotifications failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

// Fetch priority notifications
export async function fetchPriorityNotifications(n: number = 10): Promise<Notification[]> {
  await logger.info("api", `fetchPriorityNotifications called: n=${n}`);

  try {
    const res = await axios.get<{ notifications: Notification[] }>(
      `${API_BASE}/notifications/priority`,
      { params: { n }, timeout: 10000 }
    );

    await logger.info("api", `fetchPriorityNotifications succeeded: ${res.data.notifications.length} items`);
    return res.data.notifications;
  } catch (err: unknown) {
    await logger.error("api", `fetchPriorityNotifications failed: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}
