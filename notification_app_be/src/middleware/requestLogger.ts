/**
 * middleware/requestLogger.ts
 *
 * Express middleware that logs every incoming HTTP request and its response
 * status to the Affordmed test server via the Log function.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export async function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const start = Date.now();

  // Log the incoming request
  await logger.info(
    "middleware",
    `Incoming ${req.method} ${req.originalUrl} from ${req.ip}`
  );

  res.on("finish", async () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    await logger[level](
      "middleware",
      `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}
