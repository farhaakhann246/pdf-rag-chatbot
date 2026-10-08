import pg from "pg";

import { config } from "../config/index.js";

const { Pool } = pg;

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export const pool = new Pool({
  connectionString: config.databaseUrl,

  max: 10,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 5000,
});
