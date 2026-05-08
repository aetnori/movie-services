// Queries the ratings database. Right now it just computes the average rating for a given movie.
import { Database } from 'sqlite';

export function makeRatingsRepository(db: Database) {
  return {
    avgRatingForMovie: async (movieId: number): Promise<number | null> => {
      const row = await db.get<{ avg: number | null }>(
        'SELECT AVG(rating) AS avg FROM ratings WHERE movieId = ?',
        movieId,
      );
      return row?.avg ?? null;
    },
  };
}
