import { assessmentLearner } from "@/server/guest";
import { submitBuilderCheck } from "@/server/builder-learn";
import { privateHeaders, sameOrigin, smallJSON } from "@/server/request";

// Marks a builder course's knowledge check on the server, once per submission key.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const { id } = await params;
  const learner = await assessmentLearner({ create: false });
  if (!learner) return Response.json({ error: "Please sign in again before submitting." }, { status: 401 });
  let body: unknown;
  try {
    body = await smallJSON(request);
  } catch {
    return Response.json({ error: "Invalid submission. Reload the knowledge check." }, { status: 400 });
  }
  try {
    const out = await submitBuilderCheck(id, learner.id, body);
    if (out.failure)
      return Response.json({ error: out.failure.error, locked: out.failure.locked }, { status: out.failure.status, headers: privateHeaders });
    return Response.json(out.data, { headers: privateHeaders });
  } catch {
    return Response.json(
      { error: "Your result could not be confirmed. Retry this submission; it will not create a duplicate attempt." },
      { status: 503, headers: privateHeaders },
    );
  }
}
