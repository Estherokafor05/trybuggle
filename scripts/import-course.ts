// Loads the course in courses/ into the database's course tables.
// Run the migrations first (npm run db:migrate), then: npm run db:import-course
// Safe to run more than once. Uses DATABASE_URL_UNPOOLED, or DATABASE_URL.
import postgres from "postgres";
import { planCourse, writeCourse } from "../src/server/course-import";

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("A PostgreSQL connection is required.");
  const sql = postgres(url, { max: 1, connect_timeout: 15 });
  try {
    const plan = planCourse();
    const summary = await sql.begin((tx) =>
      writeCourse({ query: (text, params = []) => tx.unsafe(text, params as never[]) }, plan),
    );
    console.log(
      `Imported "${plan.title}": ${summary.sections} sections, ${summary.items} items, ` +
        `${summary.blocks} content blocks, ${summary.assessments} assessments, ${summary.questions} questions.`,
    );
  } catch (error) {
    // Report what failed without printing connection details.
    console.error("Course import failed; nothing was changed.", error instanceof Error ? error.message : "");
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

void main();
