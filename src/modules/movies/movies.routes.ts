import { Router } from 'express';
import { makeMoviesController } from './movies.controller';
import { makeMoviesService } from './movies.service';
import { makeMoviesRepository } from './movies.repository';
import { getMoviesDb, getRatingsDb } from '../../config/database';
import { makeRatingsRepository } from '../ratings/ratings.repository';
import { makeRatingsService } from '../ratings/ratings.service';

export async function createMoviesRouter(): Promise<Router> {
  const moviesDb = await getMoviesDb();
  const ratingsDb = await getRatingsDb();
  const moviesRepo = makeMoviesRepository(moviesDb);
  const ratingsRepo = makeRatingsRepository(ratingsDb);
  const ratingsService = makeRatingsService(ratingsRepo);
  const service = makeMoviesService(moviesRepo, ratingsService);
  const controller = makeMoviesController(service);

  const router = Router();
  router.get('/', controller.listAll);
  router.get('/id/:movieId', controller.getDetailByMovieId);
  router.get('/:imdbId', controller.getDetail);

  return router;
}
