// Organisations: companies, schools and teams that add their members to
// Buggle Learn, see their progress, and pay a yearly plan per learner.
// Owners and managers run an organisation; members learn. All rules run here.
import { createHash, randomBytes } from "node:crypto";
import { db } from "./database";
import { coursePath } from "./progression";

export type Role = "owner" | "manager" | "member";
export type PlanCode = "platform" | "content" | "both";
export const INVITE_DAYS = 14;
const ACTIVE = ["active", "past_due", "test"];

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const tokenShape = /^[A-Za-z0-9_-]{30,60}$/;
const cleanEmail = (raw: unknown) => (typeof raw === "string" ? raw.normalize("NFKC").trim().toLowerCase() : "");
const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Fail = { error: string };

export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}

// ---------------------------------------------------------------------------
// Plans

export type Plan = {
  code: PlanCode;
  name: string;
  description: string;
  pricePerSeatYear: number;
  /** 0 when the plan isn't offered monthly. */
  pricePerSeatMonth: number;
  currency: string;
  active: boolean;
};

export async function listPlans({ activeOnly = false } = {}): Promise<Plan[]> {
  const rows = await db()`SELECT code, name, description, price_per_seat_year, price_per_seat_month, currency, active FROM org_plans
    ${activeOnly ? db()`WHERE active AND price_per_seat_year > 0` : db()``}
    ORDER BY array_position(ARRAY['content', 'platform', 'both'], code)`;
  return rows.map((r) => ({
    code: r.code as PlanCode,
    name: r.name as string,
    description: r.description as string,
    pricePerSeatYear: r.price_per_seat_year as number,
    pricePerSeatMonth: r.price_per_seat_month as number,
    currency: r.currency as string,
    active: Boolean(r.active),
  }));
}

/** "$24.00" from 2400 and "usd". */
export function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

/** What each plan includes, for the plan pages. */
export function planIncludes(code: PlanCode | null) {
  return {
    members: Boolean(code),
    dashboard: Boolean(code),
    branding: Boolean(code),
    deepDive: code === "content" || code === "both",
    ownCourses: code === "platform" || code === "both",
  };
}

export async function savePlan(code: string, input: { price: unknown; monthly?: unknown; currency: unknown; active: boolean }): Promise<Fail | { code: string }> {
  const amount = Math.round(Number(String(input.price).replace(/[^0-9.]/g, "")) * 100);
  const monthly = Math.round(Number(String(input.monthly ?? "0").replace(/[^0-9.]/g, "") || 0) * 100);
  if (!Number.isFinite(monthly) || monthly < 0 || monthly > 100_000_00) return { error: "Enter a monthly price from 0 to 100,000, or 0 for no monthly option." };
  if (monthly > 0 && monthly < 50) return { error: "A monthly price needs to be at least 0.50, or 0 for no monthly option." };
  const currency = String(input.currency ?? "").trim().toLowerCase();
  if (!["platform", "content", "both"].includes(code)) return { error: "Unknown plan." };
  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000_00) return { error: "Enter a price from 0 to 100,000." };
  if (!/^[a-z]{3}$/.test(currency)) return { error: "Use a three-letter currency code, such as USD." };
  if (input.active && amount < 50) return { error: "A plan needs a price of at least 0.50 before it can be switched on." };
  await db()`UPDATE org_plans SET price_per_seat_year = ${amount}, price_per_seat_month = ${monthly}, currency = ${currency}, active = ${input.active}, updated_at = now() WHERE code = ${code}`;
  return { code };
}

// ---------------------------------------------------------------------------
// Organisations

export type Organisation = {
  id: string;
  slug: string;
  name: string;
  hasLogo: boolean;
  plan: PlanCode | null;
  seats: number;
  status: "none" | "active" | "past_due" | "cancelled" | "test";
  periodEnd: string | null;
  billingInterval: "month" | "year";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  hasJoinLink: boolean;
  members: number;
};

const toOrg = (r: Record<string, unknown>): Organisation => ({
  id: r.id as string,
  slug: r.slug as string,
  name: r.name as string,
  hasLogo: Boolean(r.has_logo),
  plan: (r.plan as PlanCode) ?? null,
  seats: r.seats as number,
  status: r.status as Organisation["status"],
  periodEnd: r.current_period_end ? new Date(r.current_period_end as Date).toISOString() : null,
  billingInterval: r.billing_interval === "month" ? "month" : "year",
  stripeCustomerId: (r.stripe_customer_id as string) ?? null,
  stripeSubscriptionId: (r.stripe_subscription_id as string) ?? null,
  hasJoinLink: Boolean(r.join_token_hash),
  members: Number(r.members ?? 0),
});

const orgColumns = (sql: ReturnType<typeof db>) => sql`
  o.id, o.slug, o.name, o.logo IS NOT NULL AS has_logo, o.plan, o.seats, o.status, o.current_period_end, o.billing_interval,
  o.stripe_customer_id, o.stripe_subscription_id, o.join_token_hash,
  (SELECT count(*) FROM organisation_members m WHERE m.org_id = o.id)::int AS members`;

/** Whether the plan is paid up (or simulated on a test site), so members can be added. */
export const isActive = (org: Pick<Organisation, "status">) => ACTIVE.includes(org.status);

export async function createOrganisation(user: string, rawName: unknown): Promise<Fail | { slug: string }> {
  const name = typeof rawName === "string" ? rawName.normalize("NFC").replace(/\s+/g, " ").trim() : "";
  if (name.length < 2 || name.length > 80) return { error: "Enter your organisation's name (2 to 80 characters)." };
  const sql = db();
  const [{ owned }] = await sql`SELECT count(*)::int AS owned FROM organisation_members WHERE user_id = ${user} AND role = 'owner'`;
  if (owned >= 5) return { error: "You can own up to 5 organisations. Contact us if you need more." };
  const base = slugify(name) || "organisation";
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${randomBytes(2).toString("hex")}`;
    try {
      return await sql.begin(async (tx) => {
        const [org] = await tx`INSERT INTO organisations(slug, name, created_by) VALUES(${slug}, ${name}, ${user}) RETURNING id, slug`;
        await tx`INSERT INTO organisation_members(org_id, user_id, role) VALUES(${org.id}, ${user}, 'owner')`;
        return { slug: org.slug as string };
      });
    } catch (error) {
      if (!(error instanceof Error && /organisations_slug_key/.test(error.message))) throw error;
    }
  }
  return { error: "Please try a slightly different name." };
}

/** The organisation and the user's role in it, or null if they aren't a member. */
export async function orgForMember(slug: string, user: string) {
  const sql = db();
  const [row] = await sql`SELECT ${orgColumns(sql)}, m.role FROM organisations o
    JOIN organisation_members m ON m.org_id = o.id AND m.user_id = ${user} WHERE o.slug = ${slug}`;
  return row ? { org: toOrg(row), role: row.role as Role } : null;
}

export async function orgById(id: string) {
  const sql = db();
  const [row] = await sql`SELECT ${orgColumns(sql)} FROM organisations o WHERE o.id = ${id}`;
  return row ? toOrg(row) : null;
}

export const canManage = (role: Role) => role === "owner" || role === "manager";

/** Organisations a learner belongs to, for their dashboard. */
export async function myOrganisations(user: string) {
  const sql = db();
  const rows = await sql`SELECT ${orgColumns(sql)}, m.role FROM organisations o
    JOIN organisation_members m ON m.org_id = o.id WHERE m.user_id = ${user} ORDER BY m.joined_at`;
  return rows.map((r) => ({ org: toOrg(r), role: r.role as Role }));
}

export async function logo(id: string) {
  const [row] = await db()`SELECT logo, logo_type, updated_at FROM organisations WHERE id = ${id} AND logo IS NOT NULL`;
  return row ? { bytes: row.logo as Uint8Array, type: row.logo_type as string, updated: new Date(row.updated_at as Date) } : null;
}

const LOGO_TYPES: Record<string, number[]> = {
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

export async function saveSettings(orgId: string, input: { name: unknown; logo?: File | null; removeLogo?: boolean }): Promise<Fail | { ok: true }> {
  const name = typeof input.name === "string" ? input.name.normalize("NFC").replace(/\s+/g, " ").trim() : "";
  if (name.length < 2 || name.length > 80) return { error: "Enter a name of 2 to 80 characters." };
  const sql = db();
  if (input.logo && input.logo.size > 0) {
    if (input.logo.size > 300_000) return { error: "Use a logo smaller than 300 KB." };
    const bytes = new Uint8Array(await input.logo.arrayBuffer());
    // Check the file really is the image type it claims to be.
    const type = Object.entries(LOGO_TYPES).find(([, magic]) => magic.every((b, i) => bytes[i] === b))?.[0];
    if (!type) return { error: "Use a PNG, JPEG or WebP image for the logo." };
    await sql`UPDATE organisations SET name = ${name}, logo = ${bytes}, logo_type = ${type}, updated_at = now() WHERE id = ${orgId}`;
  } else if (input.removeLogo) {
    await sql`UPDATE organisations SET name = ${name}, logo = NULL, logo_type = NULL, updated_at = now() WHERE id = ${orgId}`;
  } else {
    await sql`UPDATE organisations SET name = ${name}, updated_at = now() WHERE id = ${orgId}`;
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Members

/** Every member with their progress, for the team dashboard. */
export async function memberProgress(orgId: string) {
  const sql = db();
  const members = await sql`
    SELECT m.user_id, m.role, m.joined_at, u.name, u.email,
      (SELECT code FROM certificates c WHERE c.learner_id = m.user_id AND c.kind = 'essentials' AND c.revoked_at IS NULL LIMIT 1) AS certificate,
      GREATEST(
        (SELECT max(created_at) FROM assessment_attempts a WHERE a.learner_id = m.user_id),
        (SELECT max(created_at) FROM module_assessment_attempts f WHERE f.learner_id = m.user_id),
        (SELECT max(updated_at) FROM learning_checkpoints p WHERE p.learner_id = m.user_id)
      ) AS last_active
    FROM organisation_members m JOIN "auth_user" u ON u.id = m.user_id
    WHERE m.org_id = ${orgId}
    ORDER BY array_position(ARRAY['owner', 'manager', 'member'], m.role), u.name`;
  const ids = members.map((m) => m.user_id as string);
  const [lessons, finals] = ids.length
    ? await Promise.all([
        sql`SELECT DISTINCT learner_id, lesson_slug FROM assessment_attempts WHERE passed AND learner_id IN ${sql(ids)}`,
        sql`SELECT DISTINCT learner_id, module_slug FROM module_assessment_attempts WHERE passed AND learner_id IN ${sql(ids)}`,
      ])
    : [[], []];
  const path = coursePath();
  return members.map((m) => {
    const passedLessons = new Set(lessons.filter((l) => l.learner_id === m.user_id).map((l) => l.lesson_slug as string));
    const passedFinals = new Set(finals.filter((f) => f.learner_id === m.user_id).map((f) => f.module_slug as string));
    const done = path.filter((s) => (s.kind === "final" ? passedFinals.has(s.moduleSlug) : passedLessons.has(s.id))).length;
    return {
      id: m.user_id as string,
      name: m.name as string,
      email: m.email as string,
      role: m.role as Role,
      joined: new Date(m.joined_at as Date).toISOString(),
      done,
      total: path.length,
      certificate: (m.certificate as string) ?? null,
      lastActive: m.last_active ? new Date(m.last_active as Date).toISOString() : null,
    };
  });
}

async function seatsLeft(orgId: string) {
  const org = await orgById(orgId);
  if (!org) return { org: null, left: 0 };
  return { org, left: isActive(org) ? Math.max(0, org.seats - org.members) : 0 };
}

/** Adds a learner as a member, if there's a free seat. */
async function addMember(orgId: string, user: string, role: "manager" | "member"): Promise<Fail | { slug: string; already: boolean }> {
  const sql = db();
  return sql.begin(async (tx) => {
    // One join at a time per organisation, so seats can't be over-filled.
    const [org] = await tx`SELECT id, slug, seats, status FROM organisations WHERE id = ${orgId} FOR UPDATE`;
    if (!org) return { error: "This organisation no longer exists." };
    const [existing] = await tx`SELECT 1 FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
    if (existing) return { slug: org.slug as string, already: true };
    if (!ACTIVE.includes(org.status as string)) return { error: "This organisation's plan isn't active, so it can't add members right now." };
    const [{ n }] = await tx`SELECT count(*)::int AS n FROM organisation_members WHERE org_id = ${orgId}`;
    if (n >= (org.seats as number)) return { error: "This organisation has no free places. Ask whoever manages it to add more." };
    await tx`INSERT INTO organisation_members(org_id, user_id, role) VALUES(${orgId}, ${user}, ${role})`;
    return { slug: org.slug as string, already: false };
  });
}

export async function inviteMember(orgId: string, invitedBy: string, rawEmail: unknown, role: unknown) {
  const email = cleanEmail(rawEmail);
  if (!emailShape.test(email) || email.length > 254) return { error: "Enter a valid email address." } as const;
  const sql = db();
  const [member] = await sql`SELECT 1 FROM organisation_members m JOIN "auth_user" u ON u.id = m.user_id WHERE m.org_id = ${orgId} AND lower(u.email) = ${email}`;
  if (member) return { error: "That person is already a member." } as const;
  const { left } = await seatsLeft(orgId);
  const [{ pending }] = await sql`SELECT count(*)::int AS pending FROM organisation_invites WHERE org_id = ${orgId} AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now()`;
  if (left - pending <= 0) return { error: "Every place is taken or already invited. Add more places first." } as const;
  const token = randomBytes(32).toString("base64url");
  await sql.begin(async (tx) => {
    await tx`UPDATE organisation_invites SET revoked_at = now() WHERE org_id = ${orgId} AND email = ${email} AND accepted_at IS NULL AND revoked_at IS NULL`;
    await tx`INSERT INTO organisation_invites(org_id, email, role, token_hash, invited_by, expires_at)
      VALUES(${orgId}, ${email}, ${role === "manager" ? "manager" : "member"}, ${hash(token)}, ${invitedBy}, now() + ${`${INVITE_DAYS} days`}::interval)`;
  });
  return { email, path: `/join/${token}` } as const;
}

export async function pendingInvites(orgId: string) {
  const rows = await db()`SELECT id, email, role, expires_at FROM organisation_invites
    WHERE org_id = ${orgId} AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > now() ORDER BY created_at DESC`;
  return rows.map((r) => ({ id: r.id as string, email: r.email as string, role: r.role as string, expires: new Date(r.expires_at as Date).toISOString() }));
}

export async function cancelInvite(orgId: string, id: string) {
  await db()`UPDATE organisation_invites SET revoked_at = now() WHERE id = ${id} AND org_id = ${orgId} AND accepted_at IS NULL`;
}

/** A new join link for the organisation; the old one stops working. */
export async function newJoinLink(orgId: string) {
  const token = randomBytes(24).toString("base64url");
  await db()`UPDATE organisations SET join_token_hash = ${hash(token)}, updated_at = now() WHERE id = ${orgId}`;
  return `/join/${token}`;
}

export async function stopJoinLink(orgId: string) {
  await db()`UPDATE organisations SET join_token_hash = NULL, updated_at = now() WHERE id = ${orgId}`;
}

/** What a /join link leads to, for showing before the learner accepts. */
export async function findJoin(token: string) {
  if (!tokenShape.test(token)) return null;
  const sql = db();
  const [invite] = await sql`SELECT i.id, i.email, i.role, o.id AS org_id, o.name, o.slug FROM organisation_invites i
    JOIN organisations o ON o.id = i.org_id
    WHERE i.token_hash = ${hash(token)} AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at > now()`;
  if (invite)
    return { kind: "invite" as const, inviteId: invite.id as string, email: invite.email as string, role: invite.role as "manager" | "member", orgId: invite.org_id as string, name: invite.name as string, slug: invite.slug as string };
  const [org] = await sql`SELECT id, name, slug FROM organisations WHERE join_token_hash = ${hash(token)}`;
  return org ? { kind: "link" as const, orgId: org.id as string, name: org.name as string, slug: org.slug as string, role: "member" as const } : null;
}

/** Joins with an invite (for that email only) or the organisation's join link. */
export async function acceptJoin(token: string, user: { id: string; email: string }): Promise<Fail | { slug: string; already: boolean }> {
  const join = await findJoin(token);
  if (!join) return { error: "This link has expired or has already been used. Ask your organisation for a new one." };
  if (join.kind === "invite" && join.email !== user.email.toLowerCase())
    return { error: `This invite is for ${join.email}. Log in with that email to accept it.` };
  const result = await addMember(join.orgId, user.id, join.role);
  if ("slug" in result && join.kind === "invite")
    await db()`UPDATE organisation_invites SET accepted_at = now() WHERE id = ${join.inviteId}`;
  return result;
}

export async function setRole(orgId: string, actor: Role, user: string, role: unknown): Promise<Fail | { ok: true }> {
  if (role !== "manager" && role !== "member") return { error: "Choose manager or member." };
  const sql = db();
  const [target] = await sql`SELECT role FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  if (!target) return { error: "That person is no longer a member." };
  if (target.role === "owner") return { error: "The owner's role can't be changed here." };
  if (actor !== "owner" && role === "manager") return { error: "Only the owner can make someone a manager." };
  await sql`UPDATE organisation_members SET role = ${role} WHERE org_id = ${orgId} AND user_id = ${user}`;
  return { ok: true };
}

export async function removeMember(orgId: string, actor: { id: string; role: Role }, user: string): Promise<Fail | { ok: true }> {
  const sql = db();
  const [target] = await sql`SELECT role FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  if (!target) return { ok: true };
  if (target.role === "owner") return { error: "The owner can't be removed." };
  if (target.role === "manager" && actor.role !== "owner" && actor.id !== user) return { error: "Only the owner can remove a manager." };
  await sql`DELETE FROM organisation_members WHERE org_id = ${orgId} AND user_id = ${user}`;
  return { ok: true };
}

/** Organisations a learner is the only owner of. They must hand over or close these before deleting their account. */
export async function soleOwnerOf(user: string) {
  const rows = await db()`SELECT o.name FROM organisations o JOIN organisation_members m ON m.org_id = o.id
    WHERE m.user_id = ${user} AND m.role = 'owner'
      AND (o.status <> 'none' OR (SELECT count(*) FROM organisation_members x WHERE x.org_id = o.id) > 1)`;
  return rows.map((r) => r.name as string);
}

/** Removes organisations the learner owns that have no plan and no other members. */
export async function deleteEmptyOrganisations(user: string) {
  const gone = await db()`DELETE FROM organisations o WHERE o.status = 'none'
    AND EXISTS (SELECT 1 FROM organisation_members m WHERE m.org_id = o.id AND m.user_id = ${user} AND m.role = 'owner')
    AND (SELECT count(*) FROM organisation_members x WHERE x.org_id = o.id) = 1 RETURNING o.id::text AS id`;
  // Courses the organisation built go with it.
  if (gone.length) await db()`DELETE FROM courses WHERE organization_id = ANY(${gone.map((g) => g.id as string)}) AND source = 'builder'`;
}

/**
 * Whether a learner gets the Deep Dive through an organisation's content plan.
 * Used when the Deep Dive launches (Phase 2).
 */
export async function deepDiveThroughOrg(user: string) {
  const [row] = await db()`SELECT EXISTS (SELECT 1 FROM organisation_members m JOIN organisations o ON o.id = m.org_id
    WHERE m.user_id = ${user} AND o.plan IN ('content', 'both') AND o.status IN ('active', 'past_due', 'test')) AS ok`;
  return Boolean(row?.ok);
}

// ---------------------------------------------------------------------------
// Plan changes (from Stripe, or simulated on a test site)

export async function setSubscription(
  orgId: string,
  fields: {
    plan?: PlanCode | null;
    seats?: number;
    status: Organisation["status"];
    customerId?: string | null;
    subscriptionId?: string | null;
    periodEnd?: Date | null;
  },
) {
  const sql = db();
  await sql`UPDATE organisations SET
    plan = ${fields.plan === undefined ? sql`plan` : fields.plan},
    seats = ${fields.seats === undefined ? sql`seats` : fields.seats},
    status = ${fields.status},
    stripe_customer_id = ${fields.customerId === undefined ? sql`stripe_customer_id` : fields.customerId},
    stripe_subscription_id = ${fields.subscriptionId === undefined ? sql`stripe_subscription_id` : fields.subscriptionId},
    current_period_end = ${fields.periodEnd === undefined ? sql`current_period_end` : fields.periodEnd},
    updated_at = now()
    WHERE id = ${orgId}`;
}

export async function orgBySubscription(subscriptionId: string) {
  const [row] = await db()`SELECT id FROM organisations WHERE stripe_subscription_id = ${subscriptionId}`;
  return (row?.id as string) ?? null;
}

/** Every organisation, for the admin area. */
export async function allOrganisations() {
  const sql = db();
  const rows = await sql`SELECT ${orgColumns(sql)}, o.created_at,
    (SELECT u.email FROM organisation_members m JOIN "auth_user" u ON u.id = m.user_id WHERE m.org_id = o.id AND m.role = 'owner' LIMIT 1) AS owner
    FROM organisations o ORDER BY o.created_at DESC LIMIT 200`;
  return rows.map((r) => ({ ...toOrg(r), owner: (r.owner as string) ?? null, created: new Date(r.created_at as Date).toISOString() }));
}
