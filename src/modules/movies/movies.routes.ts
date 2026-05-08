import { Router } from 'express';
import { makeMoviesController } from './movies.controller';
import { makeMoviesService } from './movies.service';
import { makeMoviesRepository } from './movies.repository';
import { getMoviesDb } from '../../config/database';

export async function createMoviesRouter(): Promise<Router> {
  const moviesDb = await getMoviesDb();
  const moviesRepo = makeMoviesRepository(moviesDb);
  const service = makeMoviesService(moviesRepo);
  const controller = makeMoviesController(service);

  const router = Router();
  router.get('/', controller.listAll);
  router.get('/id/:movieId', controller.getDetailByMovieId);
  router.get('/:imdbId', controller.getDetail);

  return router;
}
