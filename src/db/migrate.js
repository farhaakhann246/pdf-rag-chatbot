import "dotenv/config";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const migrationsDirectory = path.join(__dirname, "migrations");

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function runMigrations() {
  await ensureMigrationsTable();

  const files = await fs.readdir(migrationsDirectory);

  const migrationFiles = files.filter((file) => file.endsWith(".sql")).sort();

  for (const filename of migrationFiles) {
    const existing = await pool.query(
      `
        SELECT 1
        FROM schema_migrations
        WHERE filename = $1
        `,
      [filename],
    );

    if (existing.rowCount > 0) {
      console.log(`Skipping migration: ${filename}`);

      continue;
    }

    const migrationPath = path.join(migrationsDirectory, filename);

    const sql = await fs.readFile(migrationPath, "utf8");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(sql);

      await client.query(
        `
        INSERT INTO schema_migrations (
          filename
        )
        VALUES ($1)
        `,
        [filename],
      );

      await client.query("COMMIT");

      console.log(`Migration completed: ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  }
}

runMigrations()
  .then(async () => {
    console.log("All migrations completed.");

    await pool.end();
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);

    await pool.end();

    process.exit(1);
  });
