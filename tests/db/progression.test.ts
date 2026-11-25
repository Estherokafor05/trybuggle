// Strict order and configurable checks (step 4), against a real in-memory
// Postgres served over a socket, using the same code the pages and API use.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, describe, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { assessmentBank, moduleAssessmentBank } from "@course/assessments";
import { planCourse, writeCourse } from "../../src/server/course-import";
import type * as Checks from "../../src/server/checks";
import type * as Progression from "../../src/server/progression";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 57000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let checks: typeof Checks;
let progression: typeof Progression;

before(async () => {
  db = await PGlite.create();
  const files = (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) await db.exec(await readFile(new URL(file, migrations), "utf8"));
  await db.transaction((tx) =>
    writeCourse({ query: async (text, params) => (await tx.query<Record<string, unknown>>(text, params)).rows }, planCourse()),
  );
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  checks = await import("../../src/server/checks");
  progression = await import("../../src/server/progression");
});

after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

const correctAnswers = (questions: { id: string; correct: string }[]) =>
  Object.fromEntries(questions.map((q) => [q.id, q.correct]));
const wrongAnswers = (questions: { id: string; correct: string; options: { id: string }[] }[]) =>
  Object.fromEntries(questions.map((q) => [q.id, q.options.find((o) => o.id !== q.correct)!.id]));
const submission = (answers: Record<string, string>) => ({ version: 1, submissionKey: randomUUID(), answers });

async function newLearner() {
  const id = `test:${randomUUID()}`;
  await db.query("INSERT INTO learners(id) VALUES($1)", [id]);
  return id;
}

/** Passes every step before (not including) the given step, through the real marking code. */
async function passUpTo(learner: string, moduleSlug: string, id: string) {
  for (const step of progression.coursePath()) {
    if (step.moduleSlug === moduleSlug && step.id === id) return;
    const ref = step.kind === "final" ? checks.finalCheck(step.moduleSlug)! : checks.lessonCheck(step.id)!;
    const out = await checks.submitCheck(ref, learner, submission(correctAnswers(ref.questions)));
    assert.equal(out.failure, undefined, `passing ${step.key}`);
  }
}

describe("the order rule", () => {
  test("the path runs through every built lesson and final assessment, module by module", () => {
    const keys = progression.coursePath().map((s) => s.key);
    assert.equal(keys.length, 12);
    assert.equal(keys[0], "ai-foundations/what-counts-as-ai");
    assert.equal(keys[5], "ai-foundations/final-assessment");
    assert.equal(keys[6], "talking-to-ai/a-new-helper");
    assert.equal(keys.at(-1), "talking-to-ai/final-assessment");
  });

  test("only the first lesson is open at the start", () => {
    const path = progression.coursePath();
    const none = new Set<string>();
    assert.deepEqual(progression.accessFrom(path, none, "ai-foundations", "what-counts-as-ai"), { open: true });
    const second = progression.accessFrom(path, none, "ai-foundations", "ai-in-your-day");
    assert.equal(second.open, false);
    assert.equal(!second.open && second.finishFirst.id, "what-counts-as-ai");
    assert.deepEqual(progression.accessFrom(path, none, "ai-foundations", "welcome"), { open: true });
  });

  test("Module 2 opens only after the Module 1 final assessment", () => {
    const path = progression.coursePath();
    const allLessons = new Set(path.filter((s) => s.moduleSlug === "ai-foundations" && s.kind === "lesson").map((s) => s.key));
    const blocked = progression.accessFrom(path, allLessons, "talking-to-ai", "a-new-helper");
    assert.equal(!blocked.open && blocked.finishFirst.key, "ai-foundations/final-assessment");
    allLessons.add("ai-foundations/final-assessment");
    assert.equal(progression.accessFrom(path, allLessons, "talking-to-ai", "a-new-helper").open, true);
  });

  test("anything already passed stays open, even with a gap before it", () => {
    const path = progression.coursePath();
    const passed = new Set(["ai-foundations/before-chatgpt"]);
    assert.equal(progression.accessFrom(path, passed, "ai-foundations", "before-chatgpt").open, true);
  });
});

describe("checks follow the order", () => {
  test("a later check can't be opened or submitted early", async () => {
    const learner = await newLearner();
    const ref = checks.lessonCheck("ai-in-your-day")!;
    const load = await checks.loadCheck(ref, learner);
    assert.equal(load.failure?.status, 403);
    assert.equal(load.failure?.locked, true);
    assert.match(load.failure!.error, /Lesson 1/);
    const submit = await checks.submitCheck(ref, learner, submission(correctAnswers(ref.questions)));
    assert.equal(submit.failure?.status, 403);
    const { rows } = await db.query("SELECT 1 FROM assessment_attempts WHERE learner_id=$1", [learner]);
    assert.equal(rows.length, 0, "nothing was saved");
  });

  test("passing a check opens the next one", async () => {
    const learner = await newLearner();
    const first = checks.lessonCheck("what-counts-as-ai")!;
    const out = await checks.submitCheck(first, learner, submission(correctAnswers(first.questions)));
    assert.equal(out.data?.passed, true);
    assert.equal((await checks.loadCheck(checks.lessonCheck("ai-in-your-day")!, learner)).failure, undefined);
    assert.equal((await progression.stepAccess(learner, "ai-foundations", "before-chatgpt")).open, false);
  });

  test("a failed check keeps the next one locked", async () => {
    const learner = await newLearner();
    const first = checks.lessonCheck("what-counts-as-ai")!;
    const out = await checks.submitCheck(first, learner, submission(wrongAnswers(first.questions)));
    assert.equal(out.data?.passed, false);
    assert.equal((await progression.stepAccess(learner, "ai-foundations", "ai-in-your-day")).open, false);
  });

  test("the final assessment opens after the last lesson, and Module 2 after that", async () => {
    const learner = await newLearner();
    await passUpTo(learner, "ai-foundations", "final-assessment");
    assert.equal((await progression.stepAccess(learner, "ai-foundations", "final-assessment")).open, true);
    assert.equal((await progression.stepAccess(learner, "talking-to-ai", "a-new-helper")).open, false);
    const final = checks.finalCheck("ai-foundations")!;
    await checks.submitCheck(final, learner, submission(correctAnswers(final.questions)));
    assert.equal((await progression.stepAccess(learner, "talking-to-ai", "a-new-helper")).open, true);
    const status = await progression.pathStatus(learner, "ai-foundations");
    assert.equal(status.done.length, 6);
    assert.deepEqual(status.locked, {});
  });
});

describe("check settings", () => {
  async function setSettings(key: string, values: { pass?: number; max?: number | null; shuffle?: boolean }) {
    await db.query(
      `UPDATE assessments SET pass_percent = coalesce($2, pass_percent), max_attempts = $3, shuffle_options = coalesce($4, shuffle_options) WHERE legacy_key = $1`,
      [key, values.pass ?? null, values.max ?? null, values.shuffle ?? null],
    );
  }

  test("imported checks start at 70%, unlimited tries, answers in their written order", async () => {
    const settings = await checks.checkSettings(checks.lessonCheck("what-counts-as-ai")!);
    assert.deepEqual(settings, { passPercent: 70, maxAttempts: null, shuffleOptions: false });
  });

  test("re-importing the course keeps settings admins changed", async () => {
    await setSettings("before-chatgpt", { pass: 90, max: 2, shuffle: true });
    await db.transaction((tx) =>
      writeCourse({ query: async (text, params) => (await tx.query<Record<string, unknown>>(text, params)).rows }, planCourse()),
    );
    const settings = await checks.checkSettings(checks.lessonCheck("before-chatgpt")!);
    assert.deepEqual(settings, { passPercent: 90, maxAttempts: 2, shuffleOptions: true });
    await setSettings("before-chatgpt", { pass: 70, max: null, shuffle: false });
  });

  test("a higher pass mark is used for marking and stored with the result", async () => {
    const learner = await newLearner();
    const ref = checks.lessonCheck("what-counts-as-ai")!;
    // 4 of 5 passes at 70% but not at 100%.
    const answers = correctAnswers(ref.questions);
    const first = ref.questions[0];
    answers[first.id] = first.options.find((o) => o.id !== first.correct)!.id;
    await setSettings("what-counts-as-ai", { pass: 100 });
    try {
      const strict = await checks.submitCheck(ref, learner, submission(answers));
      assert.equal(strict.data?.passed, false);
      const intro = checks.checkIntro(ref, await checks.checkSettings(ref), "lesson");
      assert.match(intro, /Get 5 or more right/);
    } finally {
      await setSettings("what-counts-as-ai", { pass: 70 });
    }
    const normal = await checks.submitCheck(ref, learner, submission(answers));
    assert.equal(normal.data?.passed, true);
    const { rows } = await db.query<{ pass_percent: number; passed: boolean }>(
      "SELECT pass_percent, passed FROM assessment_attempts WHERE learner_id=$1 ORDER BY created_at",
      [learner],
    );
    assert.deepEqual(rows.map((r) => [r.pass_percent, r.passed]), [[100, false], [70, true]], "changing the pass mark never changes old results");
  });

  test("a tries limit stops more attempts until the learner passes", async () => {
    const learner = await newLearner();
    const ref = checks.lessonCheck("what-counts-as-ai")!;
    await setSettings("what-counts-as-ai", { max: 2 });
    try {
      const wrong = wrongAnswers(ref.questions);
      const repeat = submission(wrong);
      assert.equal((await checks.submitCheck(ref, learner, repeat)).data?.passed, false);
      assert.equal((await checks.loadCheck(ref, learner)).data?.attemptsLeft, 1);
      assert.ok((await checks.submitCheck(ref, learner, repeat)).data, "the same submission again is not a new try");
      assert.equal((await checks.submitCheck(ref, learner, submission(wrong))).data?.passed, false);
      const third = await checks.submitCheck(ref, learner, submission(correctAnswers(ref.questions)));
      assert.equal(third.failure?.status, 403);
      assert.match(third.failure!.error, /used all 2 tries/);
      assert.equal((await checks.loadCheck(ref, learner)).data?.attemptsLeft, 0);
    } finally {
      await setSettings("what-counts-as-ai", { max: null });
    }
  });

  test("shuffled answers keep the same order for a learner and never reveal the answer", async () => {
    const ref = checks.finalCheck("ai-foundations")!;
    const once = checks.orderedOptions(ref.questions, "learner-a", true);
    const again = checks.orderedOptions(ref.questions, "learner-a", true);
    assert.deepEqual(once, again);
    assert.ok(once.every((q, i) => q.options.length === ref.questions[i].options.length));
    assert.ok(once.every((q) => !("correct" in q) && !("explanation" in q)));
    const unshuffled = checks.orderedOptions(ref.questions, "learner-a", false);
    assert.deepEqual(unshuffled[0].options, ref.questions[0].options);
  });

  test("every check in the course has a settings row", async () => {
    const { rows } = await db.query<{ legacy_key: string }>("SELECT legacy_key FROM assessments");
    const keys = new Set(rows.map((r) => r.legacy_key));
    for (const key of [...Object.keys(assessmentBank), ...Object.keys(moduleAssessmentBank)])
      assert.ok(keys.has(key), key);
  });
});
