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

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface MovieDetail {
  imdbId: string;
  title: string;
  description: string | null;
  releaseDate: string | null;
  budget: string;
  runtime: number | null;
  averageRating: number | null;
  genres: string[];
  originalLanguage: string | null;
  productionCompanies: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}
