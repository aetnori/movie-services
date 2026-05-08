import path from 'path';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  MOVIES_DB_PATH: z.string().default(path.join(__dirname, '../../db/movies.db')),
  RATINGS_DB_PATH: z.string().default(path.join(__dirname, '../../db/ratings.db')),
});

export const env = schema.parse(process.env);
