import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("A PostgreSQL connection is required.");
const sql = postgres(url, { max: 1, connect_timeout: 15 });
try {
  const folder = new URL("../migrations/", import.meta.url);
  const files = (await readdir(folder)).filter((f) => f.endsWith(".sql")).sort();
  await sql.begin(async (tx) => {
    for (const file of files) await tx.unsafe(await readFile(new URL(file, folder), "utf8"));
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
