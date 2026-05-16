/**
 * controllers/notificationController.ts
 *
 * Handles HTTP request/response for notification endpoints.
 */

import { Request, Response } from "express";
import {
  fetchAllNotifications,
  getPriorityNotifications,
  getPaginatedNotifications,
} from "../services/notificationService";
import { logger } from "../utils/logger";

// GET /api/notifications
export async function getAllNotifications(
  req: Request,
  res: Response
): Promise<void> {
  await logger.info("controller", "GET /api/notifications called");

  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const notification_type = req.query.notification_type as string | undefined;

    if (limit !== undefined && page !== undefined) {
      // Paginated response
      const result = await getPaginatedNotifications(limit, page, notification_type);
      await logger.info(
        "controller",
        `Returning paginated notifications: ${result.notifications.length} items`
      );
      res.json(result);
    } else {
      const data = await fetchAllNotifications(undefined, undefined, notification_type);
      await logger.info(
        "controller",
        `Returning all notifications: ${data.notifications?.length ?? 0} items`
      );
      res.json(data);
    }
  } catch (err: unknown) {
    await logger.error(
      "controller",
      `GET /api/notifications error: ${err instanceof Error ? err.message : String(err)}`
    );
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

// GET /api/notifications/priority?n=10
export async function getPriority(req: Request, res: Response): Promise<void> {
  await logger.info("controller", "GET /api/notifications/priority called");

  try {
    const n = req.query.n ? parseInt(req.query.n as string, 10) : 10;

    if (isNaN(n) || n < 1) {
      await logger.warn("controller", `Invalid n param: ${req.query.n}`);
      res.status(400).json({ error: "Query param 'n' must be a positive integer" });
      return;
    }

    const notifications = await getPriorityNotifications(n);

    await logger.info(
      "controller",
      `Priority inbox: returning top ${notifications.length} notifications`
    );

    res.json({ notifications });
  } catch (err: unknown) {
    await logger.error(
      "controller",
      `GET /api/notifications/priority error: ${err instanceof Error ? err.message : String(err)}`
    );
    res.status(500).json({ error: "Failed to compute priority inbox" });
  }
}
