/**
 * utils/logger.ts
 *
 * Thin wrapper that initialises the shared Logging Middleware for the backend
 * and re-exports Log + logger for use across the application.
 *
 * NOTE: Because the logging_middleware lives in a sibling folder during
 * development we import directly from its source. After `npm run build` in
 * logging_middleware you can switch the import to the compiled dist.
 */

import axios from "axios";
import config from "../config";

// ─── Types (mirror logging_middleware without circular dep) ───────────────────
type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "cache" | "controller" | "cron_job" | "db" | "domain"
  | "handler" | "repository" | "route" | "service"
  | "auth" | "config" | "middleware" | "utils";

interface LogResponse {
  logID: string;
  message: string;
}

// ─── Core Log function ────────────────────────────────────────────────────────

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<LogResponse | null> {
  const payload = { stack, level, package: pkg, message };

  try {
    const response = await axios.post<LogResponse>(
      `${config.testServer.baseUrl}/evaluation-service/logs`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.testServer.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        `[Logger] HTTP ${err.response?.status ?? "N/A"}:`,
        err.response?.data ?? err.message
      );
    } else {
      console.error("[Logger] Unexpected error:", err);
    }
    return null;
  }
}

export const logger = {
  debug: (pkg: Package, msg: string) => Log("backend", "debug", pkg, msg),
  info:  (pkg: Package, msg: string) => Log("backend", "info",  pkg, msg),
  warn:  (pkg: Package, msg: string) => Log("backend", "warn",  pkg, msg),
  error: (pkg: Package, msg: string) => Log("backend", "error", pkg, msg),
  fatal: (pkg: Package, msg: string) => Log("backend", "fatal", pkg, msg),
};

export default Log;
