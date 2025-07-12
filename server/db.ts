import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please configure your PostgreSQL database connection.",
  );
}

export const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Additional PostgreSQL configuration options
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close clients after 30 seconds of inactivity
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export const db = drizzle(pool, { schema });