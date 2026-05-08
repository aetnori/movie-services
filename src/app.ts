import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { logger } from './config/logger';
import { createMoviesRouter } from './modules/movies/movies.routes';
import { errorHandler } from './middleware/errorHandler';

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

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  });

  const moviesRouter = await createMoviesRouter();
  app.use('/api/movies', moviesRouter);

  app.use(errorHandler);

  return app;
}
