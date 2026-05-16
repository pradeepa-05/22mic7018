/**
 * services/notificationService.ts
 *
 * Responsible for fetching notifications from the Affordmed test server and
 * computing the Priority Inbox (Stage 1).
 *
 * Priority weight:
 *   Placement = 3  >  Result = 2  >  Event = 1
 *
 * Priority score = weight * 1000 + recency_ms_since_epoch (normalised)
 * so that within the same type, newer notifications rank higher.
 */

import axios from "axios";
import config from "../config";
import { logger } from "../utils/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string; // ISO-like: "2026-04-22 17:51:30"
}

export interface NotificationsApiResponse {
  notifications: Notification[];
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Weight map ───────────────────────────────────────────────────────────────

const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTimestamp(ts: string): number {
  // "2026-04-22 17:51:30" → Date
  return new Date(ts.replace(" ", "T")).getTime();
}

function priorityScore(n: Notification): number {
  const weight = TYPE_WEIGHT[n.Type] ?? 0;
  const recencyScore = parseTimestamp(n.Timestamp) / 1e10; // normalise to small float
  return weight * 1000 + recencyScore;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchAllNotifications(
  limit?: number,
  page?: number,
  notification_type?: string
): Promise<NotificationsApiResponse> {
  await logger.info("service", "Fetching notifications from test server");

  const params: Record<string, string | number> = {};
  if (limit !== undefined) params.limit = limit;
  if (page !== undefined) params.page = page;
  if (notification_type) params.notification_type = notification_type;

  try {
    const response = await axios.get<NotificationsApiResponse>(
      `${config.testServer.baseUrl}/evaluation-service/notifications`,
      {
        headers: {
          Authorization: `Bearer ${config.testServer.accessToken}`,
        },
        params,
        timeout: 10000,
      }
    );

    await logger.info(
      "service",
      `Fetched ${response.data.notifications?.length ?? 0} notifications successfully`
    );

    return response.data;
  } catch (err: unknown) {
    await logger.error(
      "service",
      `Failed to fetch notifications: ${err instanceof Error ? err.message : String(err)}`
    );
    throw err;
  }
}

// ─── Priority Inbox (Stage 1) ─────────────────────────────────────────────────

/**
 * Returns the top-n priority notifications.
 * Priority = weight (Placement>Result>Event) + recency.
 */
export async function getPriorityNotifications(
  topN: number = 10
): Promise<Notification[]> {
  await logger.info(
    "service",
    `Computing priority inbox for top ${topN} notifications`
  );

  try {
    const data = await fetchAllNotifications();
    const all = data.notifications ?? [];

    // Sort descending by priority score
    const sorted = [...all].sort(
      (a, b) => priorityScore(b) - priorityScore(a)
    );

    const top = sorted.slice(0, topN);

    await logger.info(
      "service",
      `Priority inbox computed: returning ${top.length} notifications`
    );

    return top;
  } catch (err: unknown) {
    await logger.error(
      "service",
      `Error computing priority inbox: ${err instanceof Error ? err.message : String(err)}`
    );
    throw err;
  }
}

// ─── Paginated fetch (Stage 2 support) ───────────────────────────────────────

export async function getPaginatedNotifications(
  limit: number = 10,
  page: number = 1,
  notification_type?: string
): Promise<PaginatedNotifications> {
  await logger.info(
    "service",
    `Fetching paginated notifications: page=${page} limit=${limit} type=${notification_type ?? "all"}`
  );

  try {
    const data = await fetchAllNotifications(limit, page, notification_type);
    const all = data.notifications ?? [];

    // Client-side pagination fallback (server may not paginate)
    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);
    const total = all.length;

    return {
      notifications: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err: unknown) {
    await logger.error(
      "service",
      `Paginated fetch error: ${err instanceof Error ? err.message : String(err)}`
    );
    throw err;
  }
}
