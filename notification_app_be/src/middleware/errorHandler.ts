/**
 * middleware/errorHandler.ts
 *
 * Global Express error-handling middleware.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Promise<void> {
  await logger.error(
    "handler",
    `Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`
  );

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
}
