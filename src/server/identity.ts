// Moves stored learning from one learner ID to another, so nobody loses progress:
// - learners from the old sign-in system, whose ID was "google:<Google account ID>",
//   the first time they sign in on the new system (or link that Google account);
// - anonymous guests, whose results move into the account they sign in with.
// Safe to run more than once: when nothing is left under the old ID it does nothing.

/** Runs one SQL statement with numbered parameters ($1, $2...). */
export interface Sql {
  query(text: string, params: unknown[]): Promise<unknown>;
}

/** The learner ID the old sign-in system used for a Google account. */
export function legacyGoogleLearnerId(googleAccountId: string) {
  return `google:${googleAccountId}`;
}

/**
 * Moves everything stored for `from` to `to`, inside the caller's transaction.
 * Where both have a saved place for the same lesson, the more recent one is kept.
 * Where both have a certificate for the same module, the account's own is kept.
 */
export async function moveLearnerData(sql: Sql, from: string, to: string) {
  if (!from || !to || from === to) return;
  await sql.query("INSERT INTO learners(id) VALUES($1) ON CONFLICT DO NOTHING", [to]);
  await sql.query("UPDATE assessment_attempts SET learner_id = $2 WHERE learner_id = $1", [from, to]);
  await sql.query("UPDATE module_assessment_attempts SET learner_id = $2 WHERE learner_id = $1", [from, to]);
  await sql.query(
    `INSERT INTO learning_checkpoints(learner_id, lesson_slug, revision, checkpoint, updated_at)
     SELECT $2, lesson_slug, revision, checkpoint, updated_at FROM learning_checkpoints WHERE learner_id = $1
     ON CONFLICT (learner_id, lesson_slug) DO UPDATE SET
       checkpoint = EXCLUDED.checkpoint,
       revision = GREATEST(learning_checkpoints.revision, EXCLUDED.revision) + 1,
       updated_at = EXCLUDED.updated_at
     WHERE EXCLUDED.updated_at > learning_checkpoints.updated_at`,
    [from, to],
  );
  await sql.query("DELETE FROM learning_checkpoints WHERE learner_id = $1", [from]);
  await sql.query(
    `UPDATE certificates SET learner_id = $2 WHERE learner_id = $1
     AND module_slug NOT IN (SELECT module_slug FROM certificates WHERE learner_id = $2)`,
    [from, to],
  );
  await sql.query("DELETE FROM certificates WHERE learner_id = $1", [from]);
  await sql.query("DELETE FROM learners WHERE id = $1", [from]);
}
