import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMoviesService } from '../../../src/modules/movies/movies.service';
import { makeMoviesRepository } from '../../../src/modules/movies/movies.repository';
import { makeRatingsService } from '../../../src/modules/ratings/ratings.service';
import { AppError } from '../../../src/middleware/errorHandler';
import { MovieRow } from '../../../src/modules/movies/movies.types';

type MoviesRepo = ReturnType<typeof makeMoviesRepository>;
type RatingsService = ReturnType<typeof makeRatingsService>;
type MoviesService = ReturnType<typeof makeMoviesService>;

const makeRow = (overrides: Partial<MovieRow> = {}): MovieRow => ({
  movieId: 1,
  imdbId: 'tt0094675',
  title: 'Ariel',
  overview: 'A coal miner story.',
  productionCompanies: '[{"id": 1, "name": "Acme Films"}]',
  releaseDate: '1988-10-21',
  budget: 0,
  revenue: null,
  runtime: 69,
  language: 'fi',
  genres: '[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}]',
  status: 'Released',
  ...overrides,
});

function makeRepo(overrides: Partial<MoviesRepo> = {}): MoviesRepo {
  return {
    findAll: vi.fn(),
    findByImdbId: vi.fn(),
    findByMovieId: vi.fn(),
    ...overrides,
  } as unknown as MoviesRepo;
}

function mockRatingsService(avg: number | null = 3.5): RatingsService {
  return {
    getAvgRatingForMovie: vi.fn().mockResolvedValue(avg),
  } as unknown as RatingsService;
}

describe('MoviesService', () => {
  let repo: MoviesRepo;
  let ratingsService: RatingsService;
  let service: MoviesService;

  beforeEach(() => {
    repo = makeRepo();
    ratingsService = mockRatingsService();
    service = makeMoviesService(repo, ratingsService);
  });

  describe('listAll', () => {
    it('returns paginated list items with formatted budget and genres', async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ rows: [makeRow({ budget: 4_000_000 })], total: 1 });

      const result = await service.listAll(1);

      expect(result.page).toBe(1);
      expect(result.perPage).toBe(50);
      expect(result.total).toBe(1);
      expect(result.data[0].budget).toBe('$4,000,000');
      expect(result.data[0].genres).toEqual(['Drama', 'Crime']);
      expect(result.data[0].imdbId).toBe('tt0094675');
    });

    it('handles null genres gracefully', async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ rows: [makeRow({ genres: null })], total: 1 });

      const result = await service.listAll(1);
      expect(result.data[0].genres).toEqual([]);
    });

    it('passes year filter to repository', async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ rows: [makeRow()], total: 1 });

      await service.listAll(1, { year: 1988, order: 'asc' });

      expect(vi.mocked(repo.findAll)).toHaveBeenCalledWith(1, { year: 1988, order: 'asc' });
    });

    it('passes genre filter to repository', async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ rows: [makeRow()], total: 1 });

      await service.listAll(1, { genre: 'Drama' });

      expect(vi.mocked(repo.findAll)).toHaveBeenCalledWith(1, { genre: 'Drama' });
    });

    it('passes empty string genre filter for movies with no genre', async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ rows: [makeRow({ genres: '[]' })], total: 1 });

      const result = await service.listAll(1, { genre: '' });

      expect(vi.mocked(repo.findAll)).toHaveBeenCalledWith(1, { genre: '' });
      expect(result.data[0].genres).toEqual([]);
    });
  });

  describe('getDetail', () => {
    it('returns full detail with average rating', async () => {
      vi.mocked(repo.findByImdbId).mockResolvedValue(makeRow());

      const detail = await service.getDetail('tt0094675');

      expect(detail.imdbId).toBe('tt0094675');
      expect(detail.averageRating).toBe(3.5);
      expect(detail.genres).toEqual(['Drama', 'Crime']);
      expect(detail.productionCompanies).toEqual(['Acme Films']);
      expect(detail.budget).toBe('$0');
    });

    it('throws 404 when movie not found', async () => {
      vi.mocked(repo.findByImdbId).mockResolvedValue(undefined);

      await expect(service.getDetail('tt9999999')).rejects.toMatchObject({ statusCode: 404 });
      await expect(service.getDetail('tt9999999')).rejects.toBeInstanceOf(AppError);
    });

    it('returns null averageRating when no ratings exist', async () => {
      vi.mocked(repo.findByImdbId).mockResolvedValue(makeRow());
      vi.mocked(ratingsService.getAvgRatingForMovie).mockResolvedValue(null);

      const detail = await service.getDetail('tt0094675');
      expect(detail.averageRating).toBeNull();
    });
  });

  describe('getDetailByMovieId', () => {
    it('returns full detail for a known movieId', async () => {
      vi.mocked(repo.findByMovieId).mockResolvedValue(makeRow());

      const detail = await service.getDetailByMovieId(1);

      expect(detail.imdbId).toBe('tt0094675');
      expect(detail.averageRating).toBe(3.5);
    });

    it('throws 404 when movieId not found', async () => {
      vi.mocked(repo.findByMovieId).mockResolvedValue(undefined);

      await expect(service.getDetailByMovieId(99999)).rejects.toBeInstanceOf(AppError);
      await expect(service.getDetailByMovieId(99999)).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
