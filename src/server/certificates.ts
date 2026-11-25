// Module completion and certificate rules. All checks run on the server
// from stored assessment results; nothing the browser sends is trusted.
import { randomInt, randomUUID } from "node:crypto";
import { course, getModule, modules, stepLabel } from "@course";
import { moduleAssessmentBank } from "@course/assessments";
import { db } from "./database";
import { unprintableCharacters } from "./certificate-pdf";
import { coursePath, type PathStep } from "./progression";

export type Requirement = {
  id: string;
  label: string;
  title: string;
  href: string;
  passedAt: string | null;
};
export type Certificate = {
  code: string;
  learnerName: string;
  completedOn: string;
  issuedAt: string;
};

/** The slug the certificate API and pages use for the Essentials certificate. */
export const ESSENTIALS = "essentials";
export const essentialsTitle = `${course.title} Essentials`;

export function hasFinalAssessment(moduleSlug: string) {
  return Object.hasOwn(moduleAssessmentBank, moduleSlug) && Boolean(getModule(moduleSlug));
}

/** Every lesson check plus the final assessment, with the date each was first passed. */
export async function moduleRequirements(learner: string, moduleSlug: string) {
  const mod = getModule(moduleSlug);
  if (!mod || !hasFinalAssessment(moduleSlug)) throw new Error("Unknown module");
  const sql = db();
  const slugs = mod.lessons.map((l) => l.slug);
  const lessonRows = await sql`SELECT lesson_slug, min(created_at) FILTER (WHERE passed) AS passed_at FROM assessment_attempts WHERE learner_id=${learner} AND lesson_slug IN ${sql(slugs)} GROUP BY lesson_slug`;
  const finalRows = await sql`SELECT min(created_at) FILTER (WHERE passed) AS passed_at FROM module_assessment_attempts WHERE learner_id=${learner} AND module_slug=${moduleSlug}`;
  const passedAt = new Map(lessonRows.map((r) => [r.lesson_slug as string, r.passed_at as Date | null]));
  const iso = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);
  const requirements: Requirement[] = [
    ...mod.lessons.map((l, i) => ({
      id: l.slug,
      label: `${stepLabel(mod.order, i)} knowledge check`,
      title: l.title,
      href: `/modules/${moduleSlug}/lessons/${l.slug}#knowledge-check`,
      passedAt: iso(passedAt.get(l.slug)),
    })),
    {
      id: "final-assessment",
      label: "Final assessment",
      title: `Module ${mod.order} refresher`,
      href: `/modules/${moduleSlug}/final-assessment`,
      passedAt: iso(finalRows[0]?.passed_at as Date | null),
    },
  ];
  const eligible = requirements.every((r) => r.passedAt);
  const completedAt = eligible
    ? requirements.map((r) => r.passedAt!).sort().at(-1)!
    : null;
  return { module: mod, requirements, eligible, completedAt };
}

/** Trims and checks a learner-chosen name. Returns an error message or the clean name. */
export async function cleanName(raw: unknown): Promise<{ name: string } | { error: string }> {
  if (typeof raw !== "string") return { error: "Enter the name to show on your certificate." };
  const name = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!name) return { error: "Enter the name to show on your certificate." };
  if ([...name].length > 80) return { error: "Use 80 characters or fewer." };
  if (/[\p{Cc}\p{Cf}<>{}]/u.test(name)) return { error: "Remove any special symbols from your name." };
  const missing = await unprintableCharacters(name);
  if (missing.length)
    return {
      error: `The certificate can't print these characters yet: ${missing.join(" ")}. Try writing your name in Latin, Greek or Cyrillic letters.`,
    };
  return { name };
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const part = () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
function newCode(order: number) {
  return `BL-M${order}-${part()}-${part()}`;
}
function toCertificate(row: Record<string, unknown>): Certificate {
  return {
    code: row.code as string,
    learnerName: row.learner_name as string,
    completedOn: new Date(row.completed_on as Date).toISOString().slice(0, 10),
    issuedAt: new Date(row.issued_at as Date).toISOString(),
  };
}

export async function getCertificate(learner: string, moduleSlug: string) {
  const rows = await db()`SELECT code,learner_name,completed_on,issued_at FROM certificates WHERE learner_id=${learner} AND kind='module' AND module_slug=${moduleSlug}`;
  return rows[0] ? toCertificate(rows[0]) : null;
}

/**
 * Module certificates are no longer issued: one Essentials certificate comes
 * after every module (FRD Version 2). Kept for tests and for the record of how
 * the certificates issued before step 6 were made.
 */
export async function issueCertificate(learner: string, moduleSlug: string, name: string) {
  const status = await moduleRequirements(learner, moduleSlug);
  if (!status.eligible) return { error: "Pass every knowledge check and the final assessment first." } as const;
  const sql = db();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const rows = await sql`INSERT INTO certificates(id,code,learner_id,module_slug,learner_name,completed_on,requirements) VALUES(${randomUUID()},${newCode(status.module.order)},${learner},${moduleSlug},${name},${status.completedAt!.slice(0, 10)},${sql.json(status.requirements)}) ON CONFLICT(learner_id,module_slug) DO NOTHING RETURNING code,learner_name,completed_on,issued_at`;
      if (rows[0]) return { certificate: toCertificate(rows[0]) } as const;
      return { certificate: (await getCertificate(learner, moduleSlug))! } as const;
    } catch (error) {
      // A certificate code collision is astronomically unlikely; retry with a new code.
      if (!(error instanceof Error && /certificates_code_key/.test(error.message))) throw error;
    }
  }
  throw new Error("Could not create a unique certificate ID");
}

/** Learners can correct the name; the ID and completion date never change. */
export async function renameCertificate(learner: string, moduleSlug: string, name: string) {
  const rows = await db()`UPDATE certificates SET learner_name=${name}, updated_at=now() WHERE learner_id=${learner} AND kind='module' AND module_slug=${moduleSlug} RETURNING code,learner_name,completed_on,issued_at`;
  return rows[0] ? toCertificate(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// The Essentials certificate: earned after every Essentials module.

export type EssentialsModule = {
  slug: string;
  order: number;
  title: string;
  href: string;
  /** complete, or not yet; beingMade when it can't be finished yet; skipped on test sites. */
  state: "complete" | "inProgress" | "notStarted" | "beingMade" | "skipped";
  done: number;
  total: number;
};

/**
 * On the live site every planned module counts, so nobody can earn the
 * certificate until the whole Essentials is published. Test sites skip modules
 * that are still being made so testers can try the full flow.
 */
export function essentialsSkipsUnbuilt() {
  if (process.env.ESSENTIALS_REQUIRE_ALL === "on") return false;
  return process.env.VERCEL_ENV !== "production";
}

/** The steps a module needs for the Essentials, in path order. */
function requiredSteps(mod: (typeof modules)[number], path: PathStep[]) {
  const built = path.filter((s) => s.moduleSlug === mod.slug);
  const final = Object.hasOwn(moduleAssessmentBank, mod.slug);
  // Every lesson plus the final assessment, whether or not it is built yet.
  const planned = mod.lessons.length + 1;
  const complete = built.length === planned && final;
  return { built, planned, buildComplete: complete };
}

/** Where a learner stands on the Essentials certificate. */
export async function essentialsStatus(learner: string) {
  const sql = db();
  const path = coursePath();
  const [lessonRows, finalRows] = await Promise.all([
    sql`SELECT lesson_slug, min(created_at) AS passed_at FROM assessment_attempts WHERE learner_id=${learner} AND passed GROUP BY lesson_slug`,
    sql`SELECT module_slug, min(created_at) AS passed_at FROM module_assessment_attempts WHERE learner_id=${learner} AND passed GROUP BY module_slug`,
  ]);
  const lessonPassed = new Map(lessonRows.map((r) => [r.lesson_slug as string, new Date(r.passed_at as Date)]));
  const finalPassed = new Map(finalRows.map((r) => [r.module_slug as string, new Date(r.passed_at as Date)]));
  const passedAt = (step: PathStep) =>
    step.kind === "final" ? finalPassed.get(step.moduleSlug) : lessonPassed.get(step.id);
  const skipUnbuilt = essentialsSkipsUnbuilt();
  const dates: Date[] = [];
  const list: EssentialsModule[] = [...modules]
    .sort((a, b) => a.order - b.order)
    .map((mod) => {
      const { built, planned, buildComplete } = requiredSteps(mod, path);
      const passed = built.filter((s) => passedAt(s));
      for (const step of passed) dates.push(passedAt(step)!);
      const allBuiltPassed = built.length > 0 && passed.length === built.length;
      const state: EssentialsModule["state"] =
        !built.length && skipUnbuilt
          ? "skipped"
          : allBuiltPassed && (buildComplete || skipUnbuilt)
            ? "complete"
            : allBuiltPassed || !built.length
              ? "beingMade"
              : passed.length
                ? "inProgress"
                : "notStarted";
      return {
        slug: mod.slug,
        order: mod.order,
        title: mod.title,
        href: `/modules/${mod.slug}`,
        state,
        done: passed.length,
        total: skipUnbuilt ? built.length : planned,
      };
    });
  const counted = list.filter((m) => m.state !== "skipped");
  const eligible = counted.length > 0 && counted.every((m) => m.state === "complete");
  const completedAt = eligible ? new Date(Math.max(...dates.map(Number))).toISOString() : null;
  return { modules: list, eligible, completedAt, skipUnbuilt };
}

export async function getEssentialsCertificate(learner: string) {
  const rows = await db()`SELECT code,learner_name,completed_on,issued_at FROM certificates WHERE learner_id=${learner} AND kind='essentials' AND course_slug=${course.slug}`;
  return rows[0] ? toCertificate(rows[0]) : null;
}

/** Issues once per learner, only when every Essentials module is complete. */
export async function issueEssentialsCertificate(learner: string, name: string) {
  const status = await essentialsStatus(learner);
  if (!status.eligible) return { error: "Complete every module in the Essentials first." } as const;
  const sql = db();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const rows = await sql`
        INSERT INTO certificates(id,code,learner_id,kind,course_slug,module_slug,learner_name,completed_on,requirements)
        VALUES(${randomUUID()},${`BL-E-${part()}-${part()}`},${learner},'essentials',${course.slug},NULL,${name},${status.completedAt!.slice(0, 10)},${sql.json(status.modules)})
        ON CONFLICT(learner_id,course_slug,kind) WHERE kind <> 'module' DO NOTHING
        RETURNING code,learner_name,completed_on,issued_at`;
      if (rows[0]) return { certificate: toCertificate(rows[0]) } as const;
      return { certificate: (await getEssentialsCertificate(learner))! } as const;
    } catch (error) {
      if (!(error instanceof Error && /certificates_code_key/.test(error.message))) throw error;
    }
  }
  throw new Error("Could not create a unique certificate ID");
}

/** Learners can correct the name; the ID and completion date never change. */
export async function renameEssentialsCertificate(learner: string, name: string) {
  const rows = await db()`UPDATE certificates SET learner_name=${name}, updated_at=now() WHERE learner_id=${learner} AND kind='essentials' AND course_slug=${course.slug} RETURNING code,learner_name,completed_on,issued_at`;
  return rows[0] ? toCertificate(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Public verification: anyone with a certificate ID can check it is real.

export type Verification = {
  code: string;
  title: string;
  learnerName: string;
  completedOn: string;
  issuedAt: string;
  status: "valid" | "revoked";
};

const codeShape = /^BL-(E|D|M\d{1,2})-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

/** Upper-cases and tidies a typed ID. Null if it can't be a Buggle Learn ID. */
export function normaliseCode(raw: string) {
  const code = raw.normalize("NFKC").toUpperCase().replace(/[\s\u2010-\u2015_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return codeShape.test(code) ? code : null;
}

/** Only what the certificate itself shows: never an email or account detail. */
export async function verifyCertificate(raw: string): Promise<Verification | null> {
  const code = normaliseCode(raw);
  if (!code) return null;
  const rows = await db()`SELECT code,kind,module_slug,course_slug,learner_name,completed_on,issued_at,revoked_at FROM certificates WHERE code=${code}`;
  const row = rows[0];
  if (!row) return null;
  const deepDiveTitle =
    row.kind === "deep_dive" ? ((await db()`SELECT title FROM courses WHERE slug = ${row.course_slug as string}`)[0]?.title as string | undefined) : undefined;
  const title =
    row.kind === "essentials"
      ? essentialsTitle
      : row.kind === "deep_dive"
        ? (deepDiveTitle ?? `${course.title} Deep Dive`)
        : (getModule(row.module_slug as string)?.title ?? "Buggle Learn module");
  return {
    ...toCertificate(row),
    title,
    status: row.revoked_at ? "revoked" : "valid",
  };
}

// ---------------------------------------------------------------------------
// Deep Dive course certificates: one per finished Deep Dive course.

/** A published Deep Dive course, by its address. */
async function deepDiveCourse(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const [row] = await db()`SELECT id, slug, title FROM courses WHERE slug = ${slug} AND kind = 'deep_dive' AND status = 'published' AND source = 'builder'`;
  return row ? { id: row.id as string, slug: row.slug as string, title: row.title as string } : null;
}

/** When the learner finished every unit, or null if they haven't. */
async function courseFinishedOn(learner: string, courseId: string) {
  const [row] = await db()`
    SELECT bool_and(done_at IS NOT NULL) AS all_done, count(*)::int AS n, max(done_at) AS last FROM (
      SELECT i.id, least(
        (SELECT min(d.completed_at) FROM builder_completions d WHERE d.item_id = i.id AND d.learner_id = ${learner}),
        (SELECT min(t.created_at) FROM builder_attempts t JOIN assessments a ON a.id = t.assessment_id
           WHERE a.item_id = i.id AND t.learner_id = ${learner} AND t.passed)) AS done_at
      FROM course_items i WHERE i.course_id = ${courseId}
        AND (EXISTS (SELECT 1 FROM content_blocks k WHERE k.item_id = i.id)
          OR EXISTS (SELECT 1 FROM assessments a JOIN assessment_questions q ON q.assessment_id = a.id WHERE a.item_id = i.id))
    ) x`;
  return row.n > 0 && row.all_done ? new Date(row.last as Date).toISOString() : null;
}

export async function courseCertificateStatus(learner: string, slug: string) {
  const found = await deepDiveCourse(slug);
  if (!found) return null;
  const [finishedOn, rows] = await Promise.all([
    courseFinishedOn(learner, found.id),
    db()`SELECT code,learner_name,completed_on,issued_at FROM certificates WHERE learner_id=${learner} AND kind='deep_dive' AND course_slug=${slug}`,
  ]);
  return { course: found, eligible: Boolean(finishedOn), finishedOn, certificate: rows[0] ? toCertificate(rows[0]) : null };
}

/** Issues once per learner and course, only when every unit is finished. */
export async function issueCourseCertificate(learner: string, slug: string, name: string) {
  const status = await courseCertificateStatus(learner, slug);
  if (!status) return { error: "Not found" } as const;
  if (status.certificate) return { certificate: status.certificate } as const;
  if (!status.finishedOn) return { error: "Finish every unit in this course first." } as const;
  const sql = db();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const rows = await sql`
        INSERT INTO certificates(id,code,learner_id,kind,course_slug,module_slug,learner_name,completed_on,requirements)
        VALUES(${randomUUID()},${`BL-D-${part()}-${part()}`},${learner},'deep_dive',${slug},NULL,${name},${status.finishedOn.slice(0, 10)},${sql.json({ course: status.course.title })})
        ON CONFLICT(learner_id,course_slug,kind) WHERE kind <> 'module' DO NOTHING
        RETURNING code,learner_name,completed_on,issued_at`;
      if (rows[0]) return { certificate: toCertificate(rows[0]) } as const;
      return { certificate: (await courseCertificateStatus(learner, slug))!.certificate! } as const;
    } catch (error) {
      if (!(error instanceof Error && /certificates_code_key/.test(error.message))) throw error;
    }
  }
  throw new Error("Could not create a unique certificate ID");
}

export async function renameCourseCertificate(learner: string, slug: string, name: string) {
  const rows = await db()`UPDATE certificates SET learner_name=${name}, updated_at=now() WHERE learner_id=${learner} AND kind='deep_dive' AND course_slug=${slug} RETURNING code,learner_name,completed_on,issued_at`;
  return rows[0] ? toCertificate(rows[0]) : null;
}
