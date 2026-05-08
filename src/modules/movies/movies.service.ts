import { makeMoviesRepository } from './movies.repository';
import { MovieRow, MovieListItem, PaginatedResult, GenreEntry } from './movies.types';

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

export function makeMoviesService(repo: MoviesRepo) {
  return {
    listAll: async (
      page: number,
      filters: { year?: number | null; genre?: string; order?: 'asc' | 'desc' } = {},
    ): Promise<PaginatedResult<MovieListItem>> => {
      const { rows, total } = await repo.findAll(page, filters);
      return { data: rows.map(toListItem), page, perPage: PAGE_SIZE, total };
    },
  };
}
