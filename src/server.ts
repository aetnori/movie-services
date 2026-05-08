import { createApp } from './app';
import { env } from './config/env';

async function main(): Promise<void> {
  const app = await createApp();

  app.listen(env.PORT, () => {
    console.log(`Server live on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
