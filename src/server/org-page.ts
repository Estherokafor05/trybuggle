// Loading an organisation for one of its pages: signed in, and a member.
import { notFound, redirect } from "next/navigation";
import { currentSession } from "@/auth";
import { canManage, orgForMember } from "./organisations";

export async function loadOrg(slug: string, page = "", { manage = false } = {}) {
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/org/${slug}${page}`)}`);
  const found = await orgForMember(slug, session.user.id);
  if (!found) notFound();
  if (manage && !canManage(found.role)) redirect(`/org/${slug}`);
  return { ...found, user: session.user };
}
