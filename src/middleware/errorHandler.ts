import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn({ message: err.message, statusCode: err.statusCode });
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ message: err.message, stack: err.stack });
  res.status(500).json({ error: 'An unknown error has occurred' });
}
