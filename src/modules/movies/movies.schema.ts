import { z } from 'zod';

export const listMoviesSchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  year: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (v === undefined) return undefined;
      if (v === '') return null;
      const n = Number(v);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(n) || n < 1100 || n > currentYear) {
        ctx.addIssue({ code: 'custom', message: `year must be between 1100 and ${currentYear}` });
        return z.NEVER;
      }
      return n;
    }),
  genre: z.string().max(100).optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});
// Note: if year or genre were restricted to not use empty values, the zod would be a little simpler
// e.g. year: z.coerce.number().int().positive().max(new Date().getFullYear()).optional()
// e.g. genre that matches a list: z.enum(['Action', 'Comedy', 'Drama', ...]).optional()

// Page could also max based on total pages, but omitted it for simplicity.