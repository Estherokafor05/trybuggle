import postgres from "postgres";
import { readFile } from "node:fs/promises";
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("A PostgreSQL connection is required.");
const sql = postgres(url, { max: 1, connect_timeout: 15 });
try {
  const migration = await readFile(
    new URL("../migrations/001_learning.sql", import.meta.url),
    "utf8",
  );
  await sql.begin(async (tx) => {
    await tx.unsafe(migration);
  });
  console.log("Applied additive learning tables and lesson records.");
} catch {
  console.error(
    "Migration failed. Check database connectivity and permissions; no credentials have been logged.",
  );
  process.exitCode = 1;
} finally {
  await sql.end();
}
