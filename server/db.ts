import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set in Secrets.",
  );
}

console.log("[Database] Initializing connection to external PostgreSQL...");

export const pool = new Pool({ 
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
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
