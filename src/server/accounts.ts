// Deleting learners' data: a learner's own account on request, and anonymous
// guest records that have been inactive for a long time.
import { db } from "./database";
import { forgetForumAuthor } from "./forum";

/** How long anonymous results are kept without any activity. Stated in the privacy policy. */
export const GUEST_RETENTION_MONTHS = 12;

/** Deletes everything stored for one learner, in one transaction. */
export async function deleteLearnerData(learner: string) {
  if (!learner) throw new Error("No learner");
  return db().begin(async (tx) => {
    await forgetForumAuthor(tx, learner);
    const counts = {
      certificates: (await tx`DELETE FROM certificates WHERE learner_id=${learner}`).count,
      finalAssessments: (await tx`DELETE FROM module_assessment_attempts WHERE learner_id=${learner}`).count,
      savedPlaces: (await tx`DELETE FROM learning_checkpoints WHERE learner_id=${learner}`).count,
      knowledgeChecks: (await tx`DELETE FROM assessment_attempts WHERE learner_id=${learner}`).count,
      learners: (await tx`DELETE FROM learners WHERE id=${learner}`).count,
    };
    return counts;
  });
}

/**
 * Guest learners with no activity at all in the last `months` months.
 * Only IDs starting with "guest:" can ever match, so accounts are never touched.
 */
export async function staleGuests(months = GUEST_RETENTION_MONTHS, limit = 500) {
  const rows = await db()`
    SELECT l.id FROM learners l
    WHERE l.id LIKE 'guest:%'
      AND l.created_at < now() - make_interval(months => ${months})
      AND NOT EXISTS (SELECT 1 FROM assessment_attempts a WHERE a.learner_id = l.id AND a.created_at >= now() - make_interval(months => ${months}))
      AND NOT EXISTS (SELECT 1 FROM module_assessment_attempts f WHERE f.learner_id = l.id AND f.created_at >= now() - make_interval(months => ${months}))
      AND NOT EXISTS (SELECT 1 FROM learning_checkpoints c WHERE c.learner_id = l.id AND c.updated_at >= now() - make_interval(months => ${months}))
    ORDER BY l.created_at
    LIMIT ${limit}`;
  return rows.map((r) => r.id as string).filter((id) => id.startsWith("guest:"));
}

/** Deletes inactive guest records. Returns how many guests were removed. */
export async function deleteStaleGuests(months = GUEST_RETENTION_MONTHS) {
  const ids = await staleGuests(months);
  if (!ids.length) return 0;
  await db().begin(async (tx) => {
    await tx`DELETE FROM certificates WHERE learner_id IN ${tx(ids)}`;
    await tx`DELETE FROM module_assessment_attempts WHERE learner_id IN ${tx(ids)}`;
    await tx`DELETE FROM learning_checkpoints WHERE learner_id IN ${tx(ids)}`;
    await tx`DELETE FROM assessment_attempts WHERE learner_id IN ${tx(ids)}`;
    await tx`DELETE FROM learners WHERE id IN ${tx(ids)} AND id LIKE 'guest:%'`;
  });
  return ids.length;
}
