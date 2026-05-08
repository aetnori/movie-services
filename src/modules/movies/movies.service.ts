import { makeMoviesRepository } from './movies.repository';
import { AppError } from '../../middleware/errorHandler';
import { MovieRow, MovieListItem, MovieDetail, PaginatedResult, GenreEntry, ProductionCompany } from './movies.types';

const PAGE_SIZE = 50;

type MoviesRepo = ReturnType<typeof makeMoviesRepository>;

function formatBudget(budget: number | null): string {
  if (budget === null) return '$0';
  return `$${budget.toLocaleString('en-US')}`;
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function toListItem(row: MovieRow): MovieListItem {
  return {
    imdbId: row.imdbId,
    title: row.title,
    genres: parseJson<GenreEntry[]>(row.genres, []).map((g) => g.name),
    releaseDate: row.releaseDate,
    budget: formatBudget(row.budget),
  };
}

function toDetail(row: MovieRow): MovieDetail {
  return {
    imdbId: row.imdbId,
    title: row.title,
    description: row.overview,
    releaseDate: row.releaseDate,
    budget: formatBudget(row.budget),
    runtime: row.runtime,
    averageRating: null,
    genres: parseJson<GenreEntry[]>(row.genres, []).map((g) => g.name),
    originalLanguage: row.language,
    productionCompanies: parseJson<ProductionCompany[]>(row.productionCompanies, []).map((c) => c.name),
  };
}

export function makeMoviesService(repo: MoviesRepo) {
  return {
    listAll: async (
      page: number,
      filters: { year?: number | null; genre?: string; order?: 'asc' | 'desc' } = {},
    ): Promise<PaginatedResult<MovieListItem>> => {
      const { rows, total } = await repo.findAll(page, filters);
      return { data: rows.map(toListItem), page, perPage: PAGE_SIZE, total };
    },

    getDetail: async (imdbId: string): Promise<MovieDetail> => {
      const row = await repo.findByImdbId(imdbId);
      if (!row) throw new AppError(404, `Movie ${imdbId} not found`);
      return toDetail(row);
    },

    getDetailByMovieId: async (movieId: number): Promise<MovieDetail> => {
      const row = await repo.findByMovieId(movieId);
      if (!row) throw new AppError(404, `Movie ${movieId} not found`);
      return toDetail(row);
    },
  };
}
