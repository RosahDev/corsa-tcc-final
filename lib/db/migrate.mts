import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { getPoolConfig } from "./pool-config";

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

async function ensureMigrationsTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(pool: pg.Pool): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations ORDER BY filename",
  );
  return new Set(result.rows.map((row) => row.filename));
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool(getPoolConfig(connectionString));

  try {
    await ensureMigrationsTable(pool);
    const applied = await getAppliedMigrations(pool);

    const files = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    let count = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip ${file}`);
        continue;
      }

      const sql = readFileSync(join(migrationsDir, file), "utf8");
      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`applied ${file}`);
        count += 1;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    if (count === 0) {
      console.log("no pending migrations");
    } else {
      console.log(`applied ${count} migration(s)`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
