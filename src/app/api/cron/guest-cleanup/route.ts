// Daily clean-up of anonymous guest results with no activity for 12 months.
// Called by Vercel Cron, which sends "Authorization: Bearer <CRON_SECRET>".
import { timingSafeEqual } from "node:crypto";
import { deleteStaleGuests } from "@/server/accounts";
import { privateHeaders } from "@/server/request";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorised(request))
    return Response.json({ error: "Not allowed" }, { status: 401, headers: privateHeaders });
  try {
    const deleted = await deleteStaleGuests();
    return Response.json({ deleted }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: "Clean-up failed" }, { status: 503, headers: privateHeaders });
  }
}
