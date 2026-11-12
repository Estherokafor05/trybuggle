// Module completion and certificate rules. All checks run on the server
// from stored assessment results; nothing the browser sends is trusted.
import { randomInt, randomUUID } from "node:crypto";
import { getModule } from "@/content/modules";
import { moduleAssessmentBank } from "./assessment-bank";
import { db } from "./database";
import { unprintableCharacters } from "./certificate-pdf";

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
      label: `Lesson ${i + 1} knowledge check`,
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
function newCode(order: number) {
  const part = () => Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
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
  const rows = await db()`SELECT code,learner_name,completed_on,issued_at FROM certificates WHERE learner_id=${learner} AND module_slug=${moduleSlug}`;
  return rows[0] ? toCertificate(rows[0]) : null;
}

/** Issues once per learner and module, only when every requirement is met. */
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
  const rows = await db()`UPDATE certificates SET learner_name=${name}, updated_at=now() WHERE learner_id=${learner} AND module_slug=${moduleSlug} RETURNING code,learner_name,completed_on,issued_at`;
  return rows[0] ? toCertificate(rows[0]) : null;
}
