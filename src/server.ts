import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

async function main(): Promise<void> {
  const app = await createApp();

  app.listen(env.PORT, () => {
    logger.info(`Server live on port ${env.PORT} - [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
