import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

export type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

export type SharedPackage = "auth" | "config" | "middleware" | "utils";

export type Package = BackendPackage | FrontendPackage | SharedPackage;

export interface LogConfig {
  /** Base URL of the Affordmed evaluation server, e.g. http://4.224.186.213 */
  baseUrl: string;
  /** Bearer token obtained after /evaluation-service/auth */
  accessToken: string;
}

export interface LogResponse {
  logID: string;
  message: string;
}

// ─── Module-level config ──────────────────────────────────────────────────────

let _config: LogConfig | null = null;

/**
 * Initialise the logging middleware once (e.g. at application startup).
 * Must be called before any Log() invocations.
 */
export function initLogger(config: LogConfig): void {
  if (!config.baseUrl || !config.accessToken) {
    throw new Error(
      "[Logger] initLogger: baseUrl and accessToken are required."
    );
  }
  _config = config;
  console.info("[Logger] Initialised. Base URL:", config.baseUrl);
}

// ─── Core Log function ────────────────────────────────────────────────────────

/**
 * Send a structured log entry to the Affordmed Test Server.
 *
 * @param stack   - "backend" | "frontend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - The package/layer where the log originates
 * @param message - Human-readable description of what happened
 *
 * @example
 *   Log("backend", "error", "handler", "received string, expected bool")
 *   Log("backend", "fatal", "db", "Critical database connection failure.")
 *   Log("frontend", "info", "component", "NotificationList rendered with 10 items")
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<LogResponse | null> {
  if (!_config) {
    console.error(
      "[Logger] Logger not initialised. Call initLogger() first."
    );
    return null;
  }

  const payload = { stack, level, package: pkg, message };

  try {
    const response = await axios.post<LogResponse>(
      `${_config.baseUrl}/evaluation-service/logs`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${_config.accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );

    return response.data;
  } catch (err: unknown) {
    // Never let the logger crash the host application
    if (axios.isAxiosError(err)) {
      console.error(
        `[Logger] Failed to send log – HTTP ${err.response?.status ?? "N/A"}:`,
        err.response?.data ?? err.message
      );
    } else {
      console.error("[Logger] Unexpected error while sending log:", err);
    }
    return null;
  }
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const logger = {
  debug: (stack: Stack, pkg: Package, message: string) =>
    Log(stack, "debug", pkg, message),
  info: (stack: Stack, pkg: Package, message: string) =>
    Log(stack, "info", pkg, message),
  warn: (stack: Stack, pkg: Package, message: string) =>
    Log(stack, "warn", pkg, message),
  error: (stack: Stack, pkg: Package, message: string) =>
    Log(stack, "error", pkg, message),
  fatal: (stack: Stack, pkg: Package, message: string) =>
    Log(stack, "fatal", pkg, message),
};

export default Log;
