"use server";
// Running an organisation: creating it, members, invites, settings and its plan.
// Owners and managers manage; only the owner buys or changes the plan.
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { currentSession } from "@/auth";
import { sendAccountEmail } from "@/server/email";
import {
  acceptJoin,
  canManage,
  cancelInvite,
  createOrganisation,
  inviteMember,
  newJoinLink,
  orgForMember,
  removeMember,
  saveSettings,
  setRole,
  stopJoinLink,
} from "@/server/organisations";
import { billingPortal, changeSeats, simulatePlan, startCheckout, stripeConfigured } from "@/server/payments";
import { siteOrigin } from "@/server/site";

const text = (form: FormData, name: string) => {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
};
const go = (path: string, key: "notice" | "error", value: string) => {
  revalidatePath(path.split("?")[0]);
  return `${path}${path.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;
};

async function signedIn(back: string) {
  const session = await currentSession();
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(back)}`);
  return session.user;
}

/** The organisation, if the learner may do this there. */
async function orgAs(form: FormData, need: "member" | "manager" | "owner", page = "") {
  const slug = text(form, "org");
  const back = `/org/${slug}${page}`;
  const user = await signedIn(back);
  const found = await orgForMember(slug, user.id);
  if (!found) redirect("/dashboard");
  if (need === "manager" && !canManage(found.role)) redirect(go(back, "error", "Only the owner or a manager can do that."));
  if (need === "owner" && found.role !== "owner") redirect(go(back, "error", "Only the owner can do that."));
  return { ...found, user, back };
}

export async function createOrganisationAction(form: FormData) {
  const user = await signedIn("/organisations/new");
  const result = await createOrganisation(user.id, form.get("name"));
  if ("error" in result) redirect(`/organisations/new?error=${encodeURIComponent(result.error)}`);
  redirect(`/org/${result.slug}/billing?notice=created`);
}

export type LinkState = { error?: string; link?: string; email?: string; emailed?: boolean; stopped?: boolean };

/** Creates an invite and returns its link once, so it never sits in an address bar or log. */
export async function inviteAction(_state: LinkState, form: FormData): Promise<LinkState> {
  const { org, user } = await orgAs(form, "manager", "/members");
  const result = await inviteMember(org.id, user.id, form.get("email"), form.get("role"));
  if ("error" in result) return { error: result.error };
  const link = `${await siteOrigin()}${result.path}`;
  let emailed = false;
  if (process.env.RESEND_API_KEY)
    emailed = await sendAccountEmail({
      to: result.email!,
      subject: `${user.name} invited you to learn with ${org.name}`,
      heading: `Join ${org.name} on Buggle Learn`,
      message: `${user.name} invited you to learn about AI with ${org.name} on Buggle Learn. The link works once and lasts 14 days.`,
      action: { label: "Accept the invite", url: link },
    })
      .then(() => true)
      .catch(() => false);
  revalidatePath(`/org/${org.slug}/members`);
  return { link, email: result.email, emailed };
}

export async function cancelInviteAction(form: FormData) {
  const { org, back } = await orgAs(form, "manager", "/members");
  await cancelInvite(org.id, text(form, "id"));
  redirect(go(back, "notice", "invite-cancelled"));
}

export async function joinLinkAction(_state: LinkState, form: FormData): Promise<LinkState> {
  const { org } = await orgAs(form, "manager", "/members");
  revalidatePath(`/org/${org.slug}/members`);
  if (text(form, "do") === "stop") {
    await stopJoinLink(org.id);
    return { stopped: true };
  }
  return { link: `${await siteOrigin()}${await newJoinLink(org.id)}` };
}

export async function roleAction(form: FormData) {
  const { org, role, back } = await orgAs(form, "manager", "/members");
  const result = await setRole(org.id, role, text(form, "user"), text(form, "role"));
  redirect(go(back, "error" in result ? "error" : "notice", "error" in result ? result.error : "role-saved"));
}

export async function removeMemberAction(form: FormData) {
  const { org, role, user, back } = await orgAs(form, "manager", "/members");
  const result = await removeMember(org.id, { id: user.id, role }, text(form, "user"));
  redirect(go(back, "error" in result ? "error" : "notice", "error" in result ? result.error : "member-removed"));
}

export async function leaveAction(form: FormData) {
  const { org, role, user } = await orgAs(form, "member");
  if (role === "owner") redirect(go(`/org/${org.slug}`, "error", "The owner can't leave. Contact us to hand the organisation over."));
  await removeMember(org.id, { id: user.id, role }, user.id);
  redirect("/dashboard?notice=left-organisation");
}

export async function settingsAction(form: FormData) {
  const { org, back } = await orgAs(form, "manager", "/settings");
  const file = form.get("logo");
  const result = await saveSettings(org.id, {
    name: form.get("name"),
    logo: file instanceof File ? file : null,
    removeLogo: form.get("removeLogo") === "on",
  });
  redirect(go(back, "error" in result ? "error" : "notice", "error" in result ? result.error : "settings-saved"));
}

export async function checkoutAction(form: FormData) {
  const { org, user, back } = await orgAs(form, "owner", "/billing");
  if (!stripeConfigured()) {
    const result = await simulatePlan(org, { plan: form.get("plan"), seats: form.get("seats") });
    redirect(go(back, "error" in result ? "error" : "notice", "error" in result ? result.error! : "simulated"));
  }
  let url: string;
  try {
    const result = await startCheckout(org, { plan: form.get("plan"), seats: form.get("seats") }, { email: user.email }, await siteOrigin());
    if ("error" in result) redirect(go(back, "error", result.error!));
    url = result.url!;
  } catch (error) {
    unstable_rethrow(error);
    redirect(go(back, "error", "Payments aren't working right now. Please try again shortly."));
  }
  redirect(url);
}

export async function seatsAction(form: FormData) {
  const { org, back } = await orgAs(form, "owner", "/billing");
  try {
    const result = await changeSeats(org, form.get("seats"));
    redirect(go(back, "error" in result ? "error" : "notice", "error" in result ? result.error! : "seats-saved"));
  } catch (error) {
    unstable_rethrow(error);
    redirect(go(back, "error", "The number of places couldn't be changed right now. Please try again shortly."));
  }
}

export async function portalAction(form: FormData) {
  const { org, back } = await orgAs(form, "owner", "/billing");
  let url: string;
  try {
    const result = await billingPortal(org, await siteOrigin());
    if ("error" in result) redirect(go(back, "error", result.error!));
    url = result.url!;
  } catch (error) {
    unstable_rethrow(error);
    redirect(go(back, "error", "The billing page isn't available right now. Please try again shortly."));
  }
  redirect(url);
}

export async function acceptJoinAction(form: FormData) {
  const token = text(form, "token");
  const user = await signedIn(`/join/${token}`);
  const result = await acceptJoin(token, { id: user.id, email: user.email ?? "" });
  if ("error" in result) redirect(`/join/${token}?error=${encodeURIComponent(result.error)}`);
  redirect(`/org/${result.slug}?notice=${result.already ? "already-member" : "joined"}`);
}
