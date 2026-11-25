// Loading an organisation for one of its pages: signed in, and a member.
import { notFound, redirect } from "next/navigation";
import { currentSession } from "@/auth";
import type { Builder } from "./builder";
import { canManage, isActive, orgForMember, planIncludes } from "./organisations";

export async function loadOrg(slug: string, page = "", { manage = false } = {}) {
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/org/${slug}${page}`)}`);
  const found = await orgForMember(slug, session.user.id);
  if (!found) notFound();
  if (manage && !canManage(found.role)) redirect(`/org/${slug}`);
  return { ...found, user: session.user };
}

/** An organisation's course builder: owners and managers, on a plan with its own courses. */
export async function loadOrgBuilder(slug: string, page = "/courses") {
  const found = await loadOrg(slug, page, { manage: true });
  const allowed = planIncludes(found.org.plan).ownCourses && isActive(found.org);
  const builder: Builder | null = allowed ? { kind: "org", orgId: found.org.id, userId: found.user.id } : null;
  return { ...found, builder };
}
