// Thin service layer for ratings. Rounds the average to 2 decimal places before returning it.
import { makeRatingsRepository } from './ratings.repository';

type RatingsRepo = ReturnType<typeof makeRatingsRepository>;

export function makeRatingsService(repo: RatingsRepo) {
  return {
    getAvgRatingForMovie: async (movieId: number): Promise<number | null> => {
      const avg = await repo.avgRatingForMovie(movieId);
      return avg !== null ? Math.round(avg * 100) / 100 : null;
    },
  };
}
