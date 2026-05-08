import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { closeDb } from '../../../src/config/database';
import type { Application } from 'express';

let app: Application;

beforeAll(async () => {
  process.env.LOG_LEVEL = 'error';
  app = await createApp();
});

afterAll(async () => {
  await closeDb();
});

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /api/movies — list all movies', () => {
  it('returns 200 with paginated structure', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, perPage: 50 });
    expect(typeof res.body.total).toBe('number');
    expect(res.body.total).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });

  it('returns movies with required fields', async () => {
    const res = await request(app).get('/api/movies');
    const movie = res.body.data[0];
    expect(movie).toHaveProperty('imdbId');
    expect(movie).toHaveProperty('title');
    expect(movie).toHaveProperty('genres');
    expect(movie).toHaveProperty('releaseDate');
    expect(movie).toHaveProperty('budget');
    expect(Array.isArray(movie.genres)).toBe(true);
    expect(movie.budget).toMatch(/^\$/);
  });

  it('paginates correctly with page=2', async () => {
    const page1 = await request(app).get('/api/movies?page=1');
    const page2 = await request(app).get('/api/movies?page=2');
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.data[0].imdbId).not.toBe(page2.body.data[0].imdbId);
  });
});

describe('GET /api/movies?year= — movies by year', () => {
  it('returns paginated movies for a given year', async () => {
    const res = await request(app).get('/api/movies?year=1988');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, perPage: 50 });
    expect(
      res.body.data.every((m: { releaseDate: string }) => m.releaseDate?.startsWith('1988')),
    ).toBe(true);
  });

  it('supports descending order', async () => {
    const asc = await request(app).get('/api/movies?year=1988&order=asc');
    const desc = await request(app).get('/api/movies?year=1988&order=desc');
    expect(asc.status).toBe(200);
    expect(desc.status).toBe(200);
    if (asc.body.data.length > 1) {
      expect(asc.body.data[0].releaseDate).not.toBe(desc.body.data[0].releaseDate);
    }
  });

  it('returns empty data for a year with no movies', async () => {
    const res = await request(app).get('/api/movies?year=1889');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('returns movies with no release date when year is empty string', async () => {
    const res = await request(app).get('/api/movies?year=');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
    expect(
      res.body.data.every((m: { releaseDate: string | null }) => !m.releaseDate),
    ).toBe(true);
  });
});

describe('GET /api/movies?genre= — movies by genre', () => {
  it('returns paginated movies for Drama genre', async () => {
    const res = await request(app).get('/api/movies?genre=Drama');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.every((m: { genres: string[] }) => m.genres.includes('Drama')),
    ).toBe(true);
  });

  it('returns empty data for unknown genre', async () => {
    const res = await request(app).get('/api/movies?genre=NotARealGenre12345');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('returns movies with no genres when genre is empty string', async () => {
    const res = await request(app).get('/api/movies?genre=');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
    expect(
      res.body.data.every((m: { genres: string[] }) => m.genres.length === 0),
    ).toBe(true);
  });
});

describe('GET /api/movies/:imdbId — movie detail', () => {
  it('returns full detail for a known movie', async () => {
    const res = await request(app).get('/api/movies/tt0094675');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ imdbId: 'tt0094675', title: 'Ariel' });
    expect(res.body).toHaveProperty('description');
    expect(res.body).toHaveProperty('releaseDate');
    expect(res.body).toHaveProperty('budget');
    expect(res.body).toHaveProperty('runtime');
    expect(res.body).toHaveProperty('averageRating');
    expect(res.body).toHaveProperty('genres');
    expect(res.body).toHaveProperty('originalLanguage');
    expect(res.body).toHaveProperty('productionCompanies');
    expect(Array.isArray(res.body.genres)).toBe(true);
    expect(Array.isArray(res.body.productionCompanies)).toBe(true);
    expect(res.body.budget).toMatch(/^\$/);
  });

  it('returns 404 for unknown movie', async () => {
    const res = await request(app).get('/api/movies/tt0000000');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/movies/id/:movieId — movie detail by movieId', () => {
  it('returns full detail for a known movieId', async () => {
    const res = await request(app).get('/api/movies/id/862');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('imdbId');
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('averageRating');
    expect(res.body.budget).toMatch(/^\$/);
  });

  it('returns 404 for unknown movieId', async () => {
    const res = await request(app).get('/api/movies/id/999999999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid movieId', async () => {
    const res = await request(app).get('/api/movies/id/abc');
    expect(res.status).toBe(400);
  });
});
