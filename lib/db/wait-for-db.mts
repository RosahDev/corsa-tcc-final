import pg from "pg";
import { getPoolConfig } from "./pool-config";

const { Pool } = pg;

const MAX_ATTEMPTS = 30;
const INTERVAL_MS = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const pool = new Pool(getPoolConfig(connectionString));
    try {
      await pool.query("SELECT 1");
      console.log(`database ready (attempt ${attempt})`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        console.log(`waiting for database (${attempt}/${MAX_ATTEMPTS})...`);
        await sleep(INTERVAL_MS);
      }
    } finally {
      await pool.end();
    }
  }

  throw lastError ?? new Error("database not ready");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});