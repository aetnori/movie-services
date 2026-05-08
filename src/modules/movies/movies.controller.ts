import { AppError } from '../../middleware/errorHandler';
import { NextFunction, Request, Response } from 'express';
import { listMoviesSchema } from './movies.schema';
import { makeMoviesService } from './movies.service';

type MoviesService = ReturnType<typeof makeMoviesService>;

export function makeMoviesController(service: MoviesService) {
  return {
    listAll: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { page, year, genre, order } = listMoviesSchema.parse(req.query);
        res.json(await service.listAll(page, { year, genre, order }));
      } catch (err) {
        next(err);
      }
    },

    getDetail: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const imdbId = String(req.params.imdbId ?? '').trim();
        if (!imdbId) throw new AppError(400, 'Invalid imdb id');
        res.json(await service.getDetail(imdbId));
      } catch (err) {
        next(err);
      }
    },

    getDetailByMovieId: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const movieId = Number(req.params.movieId);
        if (!Number.isInteger(movieId) || movieId <= 0) throw new AppError(400, 'Invalid movieId');
        res.json(await service.getDetailByMovieId(movieId));
      } catch (err) {
        next(err);
      }
    },
  };
}
