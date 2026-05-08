import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { createMoviesRouter } from './modules/movies/movies.routes';
import { swaggerSpec } from './swagger';

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

  // Swagger setup
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.json(swaggerSpec);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: { url: '/api-docs.json' },
  }));

  // Main router
  const moviesRouter = await createMoviesRouter();
  app.use('/api/movies', moviesRouter);

  app.use(errorHandler);

  return app;
}
