import { currentAdmin } from "@/admin-auth";
import { currentSession } from "@/auth";
import { db } from "@/server/database";
import { media } from "@/server/builder";

// An image in a builder lesson. Images from a published Buggle Learn course are
// public; anything else is shown only to people who can see that course.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await media(id).catch(() => null);
  if (!image) return new Response(null, { status: 404 });
  const [course] = await db()`SELECT c.status, c.organization_id FROM course_media m JOIN courses c ON c.id = m.course_id WHERE m.id = ${id}`;
  const open = course.status === "published" && !course.organization_id;
  if (!open && !(await mayView(course.organization_id as string | null, course.status === "published")))
    return new Response(null, { status: 404 });
  return new Response(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": open ? "public, max-age=300" : "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}

async function mayView(orgId: string | null, published: boolean) {
  if (!orgId) return Boolean(await currentAdmin());
  const session = await currentSession();
  if (!session?.user?.id) return false;
  const [m] = await db()`SELECT role FROM organisation_members WHERE org_id::text = ${orgId} AND user_id = ${session.user.id}`;
  return Boolean(m && (published || m.role !== "member"));
}
