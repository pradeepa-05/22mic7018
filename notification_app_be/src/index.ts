/**
 * index.ts – Application entry point
 *
 * Campus Notifications Microservice – Backend
 */

import express from "express";
import cors from "cors";
import config from "./config";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler } from "./middleware/errorHandler";
import notificationRoutes from "./routes/notificationRoutes";
import { logger } from "./utils/logger";

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(requestLogger);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "notification-app-be" });
});

app.use("/api/notifications", notificationRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(config.port, async () => {
  await logger.info(
    "service",
    `Notification backend started on port ${config.port}`
  );
  console.log(
    `[Server] Campus Notification Backend running at http://localhost:${config.port}`
  );
});

export default app;
