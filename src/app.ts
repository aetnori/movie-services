import express, { Request, Response } from 'express';

export async function createApp(): Promise<express.Application> {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
