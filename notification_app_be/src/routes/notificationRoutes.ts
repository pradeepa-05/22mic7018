/**
 * routes/notificationRoutes.ts
 */

import { Router } from "express";
import {
  getAllNotifications,
  getPriority,
} from "../controllers/notificationController";

const router = Router();

// GET /api/notifications          – all notifications (supports ?limit &page &notification_type)
router.get("/", getAllNotifications);

// GET /api/notifications/priority – priority inbox (?n=10)
router.get("/priority", getPriority);

export default router;
