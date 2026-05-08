export interface MovieRow {
  movieId: number;
  imdbId: string;
  title: string;
  overview: string | null;
  productionCompanies: string | null;
  releaseDate: string | null;
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
  language: string | null;
  genres: string | null;
  status: string | null;
}

export interface GenreEntry {
  id: number;
  name: string;
}

export interface MovieListItem {
  imdbId: string;
  title: string;
  genres: string[];
  releaseDate: string | null;
  budget: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}
