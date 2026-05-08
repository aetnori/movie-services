import { Database } from 'sqlite';
import { MovieRow } from './movies.types';

const PAGE_SIZE = 50;

type Filters = { year?: number | null; genre?: string; order?: 'asc' | 'desc'; };

function buildQuery(filters: Filters): { where: string; orderClause: string; params: (string | number)[]; } {
  const { year, genre, order = 'asc' } = filters;
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (year === null) {
    conditions.push(`(releaseDate IS NULL OR releaseDate = '')`);
  } else if (year !== undefined) {
    conditions.push(`strftime('%Y', releaseDate) = ?`);
    params.push(String(year));
  }

  if (genre === '') {
    conditions.push(`(genres IS NULL OR genres = '' OR genres = '[]')`);
  } else if (genre !== undefined) {
    const formatGenre = genre.replace(/[%_\\]/g, '\\$&');
    conditions.push(`genres LIKE ? ESCAPE '\\'`);
    params.push(`%"name": "${formatGenre}"%`);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    orderClause: year !== undefined && year !== null ? `ORDER BY releaseDate ${order === 'desc' ? 'DESC' : 'ASC'}` : `ORDER BY movieId ASC`,
    params,
  };
}

export function makeMoviesRepository(db: Database) {
  return {
    findAll: async (page: number, filters: Filters = {}): Promise<{ rows: MovieRow[]; total: number; }> => {
      const offset = (page - 1) * PAGE_SIZE;
      const { where, orderClause, params } = buildQuery(filters);

      const [rows, countRow] = await Promise.all([
        db.all<MovieRow[]>(`SELECT * FROM movies ${where} ${orderClause} LIMIT ? OFFSET ?`, ...params, PAGE_SIZE, offset),
        db.get<{ total: number; }>(`SELECT COUNT(*) AS total FROM movies ${where}`, ...params),
      ]);

      return { rows, total: countRow?.total ?? 0 };
    },

    findByImdbId: async (imdbId: string): Promise<MovieRow | undefined> => {
      return db.get<MovieRow>('SELECT * FROM movies WHERE imdbId = ?', imdbId);
    },

    findByMovieId: async (movieId: number): Promise<MovieRow | undefined> => {
      return db.get<MovieRow>('SELECT * FROM movies WHERE movieId = ?', movieId);
    },
  };
}
