import { z } from 'zod';

export const listMoviesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  year: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined || v === '') return v === '' ? null : undefined;
      const n = Number(v);
      return Number.isInteger(n) && n > 0 ? n : undefined;
    }),
  genre: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});
