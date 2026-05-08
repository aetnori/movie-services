import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { env } from './env';

let moviesInstance: Database | null = null;
let ratingsInstance: Database | null = null;

async function openDb(filename: string): Promise<Database> {
  const db = await open({ filename, driver: sqlite3.Database });
  await db.exec('PRAGMA journal_mode = WAL');
  await db.exec('PRAGMA foreign_keys = ON');
  return db;
}

export async function getMoviesDb(): Promise<Database> {
  if (!moviesInstance) moviesInstance = await openDb(env.MOVIES_DB_PATH);
  return moviesInstance;
}

export async function getRatingsDb(): Promise<Database> {
  if (!ratingsInstance) ratingsInstance = await openDb(env.RATINGS_DB_PATH);
  return ratingsInstance;
}

export async function closeDb(): Promise<void> {
  if (moviesInstance) {
    await moviesInstance.close();
    moviesInstance = null;
  }
  if (ratingsInstance) {
    await ratingsInstance.close();
    ratingsInstance = null;
  }
}
