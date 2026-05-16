/**
 * utils/logger.ts
 *
 * Frontend-side logging that calls the Affordmed test server log API.
 */

import axios from "axios";

type Level = "debug" | "info" | "warn" | "error" | "fatal";
type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

const BASE_URL =
  process.env.NEXT_PUBLIC_TEST_SERVER_BASE_URL ?? "http://4.224.186.213";
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN ?? "";

export async function Log(
  level: Level,
  pkg: FrontendPackage,
  message: string
): Promise<void> {
  try {
    await axios.post(
      `${BASE_URL}/evaluation-service/logs`,
      { stack: "frontend", level, package: pkg, message },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );
  } catch {
    // Never crash the UI because of a logger failure
    console.warn("[FE Logger] Failed to send log:", { level, pkg, message });
  }
}

export const logger = {
  debug: (pkg: FrontendPackage, msg: string) => Log("debug", pkg, msg),
  info:  (pkg: FrontendPackage, msg: string) => Log("info",  pkg, msg),
  warn:  (pkg: FrontendPackage, msg: string) => Log("warn",  pkg, msg),
  error: (pkg: FrontendPackage, msg: string) => Log("error", pkg, msg),
  fatal: (pkg: FrontendPackage, msg: string) => Log("fatal", pkg, msg),
};

export default Log;
