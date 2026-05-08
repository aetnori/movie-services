// Defines the OpenAPI spec for Swagger UI. Component schemas live here, endpoint docs live in movies.routes.ts.
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movies API',
      version: '1.0.0',
      description: 'REST API for browsing movies — Node.js, TypeScript, SQLite',
    },
    tags: [
      {
        name: 'Movies',
        description: 'Movie listing and detail endpoints',
      },
    ],
    components: {
      schemas: {
        MovieListItem: {
          type: 'object',
          properties: {
            imdbId: { type: 'string', example: 'tt0094675' },
            title: { type: 'string', example: 'Ariel' },
            genres: { type: 'array', items: { type: 'string' }, example: ['Drama', 'Crime'] },
            releaseDate: { type: 'string', nullable: true, example: '1988-10-21' },
            budget: { type: 'string', example: '$4,000,000' },
          },
        },
        MovieDetail: {
          type: 'object',
          properties: {
            imdbId: { type: 'string', example: 'tt0094675' },
            title: { type: 'string', example: 'Ariel' },
            description: { type: 'string', nullable: true },
            releaseDate: { type: 'string', nullable: true, example: '1988-10-21' },
            budget: { type: 'string', example: '$0' },
            runtime: { type: 'number', nullable: true, example: 69 },
            averageRating: { type: 'number', nullable: true, example: 3.4 },
            genres: { type: 'array', items: { type: 'string' }, example: ['Drama', 'Crime'] },
            originalLanguage: { type: 'string', nullable: true, example: 'fi' },
            productionCompanies: { type: 'array', items: { type: 'string' } },
          },
        },
        PaginatedMovies: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/MovieListItem' } },
            page: { type: 'integer', example: 1 },
            perPage: { type: 'integer', example: 50 },
            total: { type: 'integer', example: 45430 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Movie tt0000000 not found' },
          },
        },
      },
    },
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './dist/modules/**/*.routes.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
