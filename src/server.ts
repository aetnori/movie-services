import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { closeDb } from './config/database';

async function main(): Promise<void> {
  const app = await createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server live on port ${env.PORT} - [${env.NODE_ENV}]`);
  });

  async function shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await closeDb();
      logger.info('Shutdown complete');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
