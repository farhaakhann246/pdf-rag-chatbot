import { pool } from "./pool.js";

export async function checkDatabaseConnection() {
  const result = await pool.query("SELECT NOW() AS current_time");

  return {
    connected: true,
    currentTime: result.rows[0].current_time,
  };
}
