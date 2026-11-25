import { assessmentLearner } from "@/server/guest";
import { loadBuilderCheck } from "@/server/builder-learn";
import { privateHeaders } from "@/server/request";

// A knowledge check in a builder course, without the right answers.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const learner = await assessmentLearner({ create: false });
  if (!learner) return Response.json({ error: "Sign in to take the knowledge check." }, { status: 401, headers: privateHeaders });
  try {
    const out = await loadBuilderCheck(id, learner.id);
    if (out.failure)
      return Response.json({ error: out.failure.error, locked: out.failure.locked }, { status: out.failure.status, headers: privateHeaders });
    return Response.json(out.data, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "The knowledge check is temporarily unavailable. Your learning place is unchanged." }, { status: 503, headers: privateHeaders });
  }
}
