import express, { Request, Response } from 'express';
import { logger } from './config/logger';

export async function createApp(): Promise<express.Application> {
  const app = express();

  app.use(express.json());

  app.use((req, _res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
