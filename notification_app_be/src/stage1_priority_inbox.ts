/**
 * stage1_priority_inbox.ts
 *
 * Stage 1 – Priority Inbox
 *
 * Fetches all notifications from the Affordmed test server and outputs
 * the top-N most important ones based on:
 *   Priority = weight (Placement=3 > Result=2 > Event=1) + recency
 *
 * HOW TO RUN:
 *   1.  npm install axios dotenv ts-node typescript @types/node
 *   2.  Set ACCESS_TOKEN in your environment or a .env file
 *   3.  npx ts-node stage1_priority_inbox.ts
 */

import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.TEST_SERVER_BASE_URL ?? "http://4.224.186.213";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN ?? "";
const TOP_N = 10; // Change to 15, 20, etc. as needed

if (!ACCESS_TOKEN) {
  console.error("ERROR: ACCESS_TOKEN environment variable is not set.");
  process.exit(1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "Placement" | "Result" | "Event";

interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string; // "2026-04-22 17:51:30"
}

// ─── Priority weights ────────────────────────────────────────────────────────

const WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function parseTimestamp(ts: string): number {
  return new Date(ts.replace(" ", "T")).getTime();
}

/**
 * Priority score:
 *   weight * 1e13 + epoch_ms
 *
 * Multiplying weight by a large number ensures type priority always wins over
 * recency when comparing across types.
 */
function priorityScore(n: Notification): number {
  return (WEIGHT[n.Type] ?? 0) * 1e13 + parseTimestamp(n.Timestamp);
}

// ─── Logging helper ───────────────────────────────────────────────────────────

async function Log(
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg: string,
  message: string
): Promise<void> {
  try {
    await axios.post(
      `${BASE_URL}/evaluation-service/logs`,
      { stack: "backend", level, package: pkg, message },
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        timeout: 8000,
      }
    );
  } catch {
    // Never crash on logger failure
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function getTopNPriorityNotifications(n: number): Promise<Notification[]> {
  await Log("info", "service", `Fetching all notifications from test server`);

  const response = await axios.get<{ notifications: Notification[] }>(
    `${BASE_URL}/evaluation-service/notifications`,
    {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      timeout: 10000,
    }
  );

  const all = response.data.notifications ?? [];
  await Log("info", "service", `Fetched ${all.length} notifications`);

  // Sort by priority score descending
  const sorted = [...all].sort((a, b) => priorityScore(b) - priorityScore(a));

  const top = sorted.slice(0, n);
  await Log("info", "service", `Computed top ${top.length} priority notifications`);

  return top;
}

async function main(): Promise<void> {
  console.log(`\n===== Stage 1: Priority Inbox (Top ${TOP_N}) =====\n`);

  try {
    const topNotifications = await getTopNPriorityNotifications(TOP_N);

    topNotifications.forEach((n, i) => {
      console.log(
        `#${String(i + 1).padStart(2, "0")} [${n.Type.padEnd(9)}] ${n.Message.padEnd(40)} ${n.Timestamp}  (score: ${priorityScore(n).toFixed(0)})`
      );
    });

    console.log("\n===== End of Priority Inbox =====\n");
  } catch (err: unknown) {
    await Log(
      "fatal",
      "service",
      `Stage 1 failed: ${err instanceof Error ? err.message : String(err)}`
    );
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
