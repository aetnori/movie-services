import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: {
      MOVIES_DB_PATH: './src/db/movies.db',
      RATINGS_DB_PATH: './src/db/ratings.db',
    },
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', 'src/db/migrate.ts'],
    },
    setupFiles: [],
    maxWorkers: 1,
  },
});
