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
  };
}
