import { privateHeaders } from "@/server/request";
import { assessmentLearner } from "@/server/guest";
import { lessonCheck, loadCheck } from "@/server/checks";

// Serves a lesson's knowledge check without correct answers.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ref = lessonCheck(id);
  if (!ref) return Response.json({ error: "Assessment not found" }, { status: 404 });
  const learner = await assessmentLearner({ create: false });
  if (!learner)
    return Response.json({ error: "Sign in to take the knowledge check." }, { status: 401, headers: privateHeaders });
  try {
    const out = await loadCheck(ref, learner.id);
    if (out.failure)
      return Response.json({ error: out.failure.error, locked: out.failure.locked }, { status: out.failure.status, headers: privateHeaders });
    return Response.json(out.data, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "The knowledge check is temporarily unavailable. Your learning place is unchanged." },
      { status: 503, headers: privateHeaders },
    );
  }
}
