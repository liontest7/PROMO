import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Survival mechanism: handle pool errors to prevent crash
pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });

export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log("[Database] External connection verified successfully.");
    return true;
  } catch (error) {
    console.error("[Database] External connection failed:", error);
    return false;
  }
}
