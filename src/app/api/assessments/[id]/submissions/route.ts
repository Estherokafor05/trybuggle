import { randomUUID } from "node:crypto";
import { assessmentBank } from "@/server/assessment-bank";
import { assessmentLearner, lessonOpenToGuests } from "@/server/guest";
import {
  privateHeaders,
  sameOrigin,
  smallJSON,
} from "@/server/request";
import { db } from "@/server/database";
import { scoreAssessment } from "@/lib/assessment-scoring";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { id } = await params;
  const learner = await assessmentLearner({ create: lessonOpenToGuests(id) });
  if (!learner)
    return Response.json(
      { error: "Please sign in again before submitting." },
      { status: 401 },
    );
  const user = learner.id;
  const questions = Object.hasOwn(assessmentBank, id)
    ? assessmentBank[id]
    : null;
  if (!questions)
    return Response.json({ error: "Assessment not found" }, { status: 404 });
  let submissionKey: string, answers: Record<string, string>, result;
  try {
    const body = await smallJSON(request);
    if (
      !body ||
      Object.keys(body).some(
        (k) => !["submissionKey", "answers", "version"].includes(k),
      ) ||
      body.version !== 1 ||
      typeof body.submissionKey !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.submissionKey,
      )
    )
      throw new Error("Invalid submission. Reload the knowledge check.");
    submissionKey = body.submissionKey;
    answers = body.answers;
    result = scoreAssessment(questions, answers, questions.length);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid answers" },
      { status: 400 },
    );
  }
  try {
    const sql = db();
    const attempt = await sql.begin(async (tx) => {
      await tx`INSERT INTO learners(id) VALUES(${user}) ON CONFLICT DO NOTHING`;
      const created =
        await tx`INSERT INTO assessment_attempts(id,learner_id,lesson_slug,assessment_version,submission_key,answers,question_count,correct_count,feedback) VALUES(${randomUUID()},${user},${id},1,${submissionKey},${tx.json(answers)},${questions.length},${result.correct},${tx.json(result.feedback)}) ON CONFLICT(learner_id,lesson_slug,submission_key) DO NOTHING RETURNING id,correct_count,passed,feedback,created_at,answers`;
      if (created.length) return created[0];
      const existing =
        await tx`SELECT id,correct_count,passed,feedback,created_at,answers FROM assessment_attempts WHERE learner_id=${user} AND lesson_slug=${id} AND submission_key=${submissionKey}`;
      return existing[0];
    });
    if (
      !attempt ||
      questions.some((q) => attempt.answers[q.id] !== answers[q.id])
    )
      return Response.json(
        {
          error:
            "This submission was already saved with different answers. Reload to review it.",
        },
        { status: 409, headers: privateHeaders },
      );
    const { answers: storedAnswers, ...response } = attempt;
    void storedAnswers;
    return Response.json(response, { headers: privateHeaders });
  } catch {
    return Response.json(
      {
        error:
          "Your result could not be confirmed. Retry this submission; it will not create a duplicate attempt.",
      },
      { status: 503, headers: privateHeaders },
    );
  }
}
