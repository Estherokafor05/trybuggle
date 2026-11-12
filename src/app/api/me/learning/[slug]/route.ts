import { db } from "@/server/database";
import {
  learnerId,
  privateHeaders,
  sameOrigin,
  smallJSON,
} from "@/server/request";
import { parseCheckpoint } from "@/lib/learning-state";
import { exploreGuides } from "@/content/explore-guides";
type Context = { params: Promise<{ slug: string }> };
export async function GET(_request: Request, { params }: Context) {
  const user = await learnerId();
  if (!user)
    return Response.json(
      { error: "Sign in to load your learning place." },
      { status: 401, headers: privateHeaders },
    );
  const { slug } = await params;
  if (!Object.hasOwn(exploreGuides, slug))
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  try {
    const rows =
      await db()`SELECT checkpoint,revision FROM learning_checkpoints WHERE learner_id=${user} AND lesson_slug=${slug}`;
    return Response.json(rows[0] ?? { checkpoint: null, revision: 0 }, {
      headers: privateHeaders,
    });
  } catch {
    return Response.json(
      { error: "Your saved place is temporarily unavailable." },
      { status: 503, headers: privateHeaders },
    );
  }
}
export async function POST(request: Request, { params }: Context) {
  if (!sameOrigin(request))
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const user = await learnerId();
  if (!user)
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  const { slug } = await params;
  let checkpoint, revision;
  try {
    const body = await smallJSON(request);
    if (
      !body ||
      Object.keys(body).some((k) => !["checkpoint", "revision"].includes(k))
    )
      throw new Error();
    checkpoint = parseCheckpoint(body.checkpoint, slug);
    revision = body.revision;
    if (!checkpoint || !Number.isSafeInteger(revision) || revision < 0)
      throw new Error();
  } catch {
    return Response.json({ error: "Invalid learning place." }, { status: 400 });
  }
  try {
    const sql = db();
    await sql`INSERT INTO learners(id) VALUES(${user}) ON CONFLICT DO NOTHING`;
    const rows =
      revision === 0
        ? await sql`INSERT INTO learning_checkpoints(learner_id,lesson_slug,checkpoint) VALUES(${user},${slug},${sql.json(checkpoint)}) ON CONFLICT DO NOTHING RETURNING revision`
        : await sql`UPDATE learning_checkpoints SET checkpoint=${sql.json(checkpoint)},revision=revision+1,updated_at=now() WHERE learner_id=${user} AND lesson_slug=${slug} AND revision=${revision} RETURNING revision`;
    if (!rows.length)
      return Response.json(
        {
          error:
            "A newer place was saved on another tab or device. Load the newer place before continuing.",
        },
        { status: 409, headers: privateHeaders },
      );
    return Response.json(
      { revision: rows[0].revision },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "Your place could not be saved. Please try again." },
      { status: 503, headers: privateHeaders },
    );
  }
}
