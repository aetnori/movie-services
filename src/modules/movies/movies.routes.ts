import { Router } from 'express';
import { makeMoviesController } from './movies.controller';
import { makeMoviesService } from './movies.service';
import { makeMoviesRepository } from './movies.repository';
import { getMoviesDb, getRatingsDb } from '../../config/database';
import { makeRatingsRepository } from '../ratings/ratings.repository';
import { makeRatingsService } from '../ratings/ratings.service';

/**
 * @openapi
 * /api/movies:
 *   get:
 *     summary: List movies
 *     tags: [Movies]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1, minimum: 1, maximum: 10000 } }
 *       - in: query
 *         name: year
 *         description: 'Filter by release year (1100–present). Use the API directly with an empty string to return movies with no release date (not supported in Swagger UI).'
 *         schema: { type: string, example: '2000' }
 *       - in: query
 *         name: genre
 *         description: 'Filter by genre (max 100 chars). Use the API directly with an empty string to return movies with no genre (not supported in Swagger UI).'
 *         schema: { type: string, example: 'Drama' }
 *       - { in: query, name: order, description: 'Sort direction when filtering by year.', schema: { type: string, enum: [asc, desc], default: asc } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedMovies'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/movies/id/{movieId}:
 *   get:
 *     summary: Movie detail by movieId
 *     tags: [Movies]
 *     parameters:
 *       - { in: path, name: movieId, required: true, schema: { type: integer, example: 862 } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieDetail'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/movies/{imdbId}:
 *   get:
 *     summary: Movie detail by IMDb ID
 *     tags: [Movies]
 *     parameters:
 *       - { in: path, name: imdbId, required: true, schema: { type: string, example: tt0094675 } }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MovieDetail'
 *       404:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
