# Movie Services

REST API for browsing movies and ratings. 

Tech Stack:
- Node.js
- TypeScript
- Express 
- SQLite.

## Setup

```bash
#development w/ hot reload
npm install
cp .env.example .env
npm run dev
```

```bash
# production
npm run build
npm start       
```

Swagger UI available at `http://localhost:3000/api-docs` once running.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server binds to |
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `LOG_LEVEL` | `info` | `error` \| `warn` \| `info` \| `http` \| `debug` |
| `MOVIES_DB_PATH` | `src/db/movies.db` | Path to movies SQLite file |
| `RATINGS_DB_PATH` | `src/db/ratings.db` | Path to ratings SQLite file |

Note: this is tested via env.ts to ensure valid values or set defaults

## Endpoints to satisfy ACs

### `GET /api/movies`

Returns a paginated list of movies (50 per page). All query params are optional and stackable.

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number, default `1` |
| `year` | integer | Filter by release year. Pass `year=` (empty) to return movies with no release date. |
| `genre` | string | Filter by genre name. Pass `genre=` (empty) to return movies with no genre assigned. |
| `order` | `asc` \| `desc` | Sort direction by release date. Only applies when `year` is set. Default `asc`. |

**Response fields:** `imdbId`, `title`, `genres`, `releaseDate`, `budget`

Examples:
```
GET /api/movies
GET /api/movies?page=2
GET /api/movies?year=1999
GET /api/movies?genre=Drama
GET /api/movies?year=1999&genre=Drama&order=desc
GET /api/movies?year=          → movies with no release date
GET /api/movies?genre=         → movies with no genre
```

### `GET /api/movies/:imdbId`

Returns full detail for a movie by its IMDb ID.

**Response fields:** `imdbId`, `title`, `description`, `releaseDate`, `budget`, `runtime`, `averageRating`, `genres`, `originalLanguage`, `productionCompanies`

- `budget` is formatted as a USD string (e.g. `$4,000,000`)
- `averageRating` is pulled from the ratings database and is `null` for ~94% of the catalog due to partial dataset overlap

```
GET /api/movies/tt0094675
```

### `GET /api/movies/id/:movieId`

Same response as above, but by `movieId` instead of IMDb ID.

```
GET /api/movies/id/862
```


### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }`. Used for server is live.


## Running tests

```bash
npm test
```


## Project structure

```
src/
├── config/         # env validation, database connections, logger
├── middleware/     # error handler
├── modules/
│   ├── movies/     # routes, controller, service, repository, schema, types
│   └── ratings/    # repository, service
├── app.ts          # Express wiring
├── swagger.ts      # OpenAPI config
└── server.ts       # process entry, port binding, graceful shutdown
```

Each module follows strict layering: **routes → controller → service → repository**.

- HTTP handling lives in the controller
- Business logic in the service
- SQL in the repository
