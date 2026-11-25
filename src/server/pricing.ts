// Prices, the launch offer, sales and discount codes, set by admins.
// Only one discount applies to a payment: the biggest one available.
import { db } from "./database";

export type PriceCode = "course" | "all_month" | "all_year";
export type Price = { code: PriceCode; amount: number; currency: string; active: boolean };
export type Buying = "course" | "all_access" | "org";
type Fail = { error: string };

export const PRICE_NAMES: Record<PriceCode, string> = {
  course: "One course (pay once, keep for good)",
  all_month: "All-access, monthly",
  all_year: "All-access, yearly",
};

export async function learnerPrices() {
  const rows = await db()`SELECT code, amount, currency, active FROM learner_prices ORDER BY array_position(ARRAY['course','all_month','all_year'], code)`;
  const list = rows.map((r) => ({ code: r.code as PriceCode, amount: r.amount as number, currency: r.currency as string, active: Boolean(r.active) && (r.amount as number) > 0 }));
  return Object.fromEntries(list.map((p) => [p.code, p])) as Record<PriceCode, Price>;
}

/** "24.50" or "$24.50" into cents. */
export function parseAmount(raw: unknown): number | null {
  const text = String(raw ?? "").replace(/[^0-9.]/g, "");
  if (!text) return 0;
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 100);
}

export async function saveLearnerPrices(input: Record<PriceCode, { amount: unknown; active: boolean }>): Promise<Fail | { ok: true }> {
  const sql = db();
  for (const code of ["course", "all_month", "all_year"] as PriceCode[]) {
    const amount = parseAmount(input[code].amount);
    if (amount === null) return { error: `Check the price for "${PRICE_NAMES[code]}".` };
    if (input[code].active && amount < 50) return { error: `"${PRICE_NAMES[code]}" needs a price of at least $0.50 to switch on.` };
    await sql`UPDATE learner_prices SET amount = ${amount}, active = ${input[code].active}, updated_at = now() WHERE code = ${code}`;
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Offers and codes

export type Offers = { launchOn: boolean; launchPercent: number; salePercent: number; saleEndsAt: string | null };

export async function offers(): Promise<Offers> {
  const [r] = await db()`SELECT launch_on, launch_percent, sale_percent, sale_ends_at FROM offers WHERE id = 'main'`;
  if (!r) return { launchOn: false, launchPercent: 20, salePercent: 0, saleEndsAt: null };
  return {
    launchOn: Boolean(r.launch_on),
    launchPercent: r.launch_percent as number,
    salePercent: r.sale_percent as number,
    saleEndsAt: r.sale_ends_at ? new Date(r.sale_ends_at as Date).toISOString() : null,
  };
}

export async function saveOffers(input: { launchOn: boolean; launchPercent: unknown; salePercent: unknown; saleEndsAt: unknown }): Promise<Fail | { ok: true }> {
  const launch = Number(input.launchPercent);
  const sale = Number(input.salePercent || 0);
  if (!Number.isInteger(launch) || launch < 1 || launch > 90) return { error: "The launch offer must be 1% to 90%." };
  if (!Number.isInteger(sale) || sale < 0 || sale > 90) return { error: "The sale must be 0% to 90%." };
  const end = String(input.saleEndsAt ?? "").trim();
  const ends = end ? new Date(`${end}T23:59:59Z`) : null;
  if (ends && Number.isNaN(ends.getTime())) return { error: "Choose a date for the end of the sale." };
  if (sale && !ends) return { error: "Choose when the sale ends." };
  await db()`UPDATE offers SET launch_on = ${input.launchOn}, launch_percent = ${launch}, sale_percent = ${sale},
    sale_ends_at = ${sale ? ends : null}, updated_at = now() WHERE id = 'main'`;
  return { ok: true };
}

export const cleanCode = (raw: unknown) => String(raw ?? "").normalize("NFKC").trim().toUpperCase().replace(/\s+/g, "");

export async function listCodes() {
  const rows = await db()`SELECT code, percent, applies_to, expires_at, max_uses, uses, active FROM discount_codes ORDER BY created_at DESC`;
  return rows.map((r) => ({
    code: r.code as string,
    percent: r.percent as number,
    appliesTo: r.applies_to as "any" | Buying | "all_access",
    expiresAt: r.expires_at ? new Date(r.expires_at as Date).toISOString() : null,
    maxUses: (r.max_uses as number | null) ?? null,
    uses: r.uses as number,
    active: Boolean(r.active),
  }));
}

export async function saveCode(input: { code: unknown; percent: unknown; appliesTo: unknown; expiresAt: unknown; maxUses: unknown }): Promise<Fail | { code: string }> {
  const code = cleanCode(input.code);
  if (!/^[A-Z0-9-]{3,30}$/.test(code)) return { error: "Codes use 3 to 30 letters, numbers or dashes, like LAUNCH20." };
  const percent = Number(input.percent);
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) return { error: "The discount must be 1% to 100%." };
  const appliesTo = ["course", "all_access", "org"].includes(String(input.appliesTo)) ? String(input.appliesTo) : "any";
  const end = String(input.expiresAt ?? "").trim();
  const expires = end ? new Date(`${end}T23:59:59Z`) : null;
  if (expires && Number.isNaN(expires.getTime())) return { error: "Choose a real end date, or leave it empty." };
  const max = String(input.maxUses ?? "").trim() ? Number(input.maxUses) : null;
  if (max !== null && (!Number.isInteger(max) || max < 1)) return { error: "Uses must be a whole number, or empty for no limit." };
  await db()`INSERT INTO discount_codes(code, percent, applies_to, expires_at, max_uses) VALUES(${code}, ${percent}, ${appliesTo}, ${expires}, ${max})
    ON CONFLICT (code) DO UPDATE SET percent = EXCLUDED.percent, applies_to = EXCLUDED.applies_to, expires_at = EXCLUDED.expires_at,
      max_uses = EXCLUDED.max_uses, active = true`;
  return { code };
}

export async function setCodeActive(code: string, active: boolean) {
  await db()`UPDATE discount_codes SET active = ${active} WHERE code = ${cleanCode(code)}`;
}

/** A code that can be used now for this kind of purchase, or why not. */
export async function checkCode(raw: unknown, buying: Buying): Promise<{ code: string; percent: number } | Fail | null> {
  const code = cleanCode(raw);
  if (!code) return null;
  const [r] = await db()`SELECT code, percent, applies_to, expires_at, max_uses, uses, active FROM discount_codes WHERE code = ${code}`;
  if (!r || !r.active) return { error: "That discount code isn't right. Check it and try again." };
  if (r.expires_at && new Date(r.expires_at as Date) < new Date()) return { error: "That discount code has ended." };
  if (r.max_uses != null && (r.uses as number) >= (r.max_uses as number)) return { error: "That discount code has been used up." };
  if (r.applies_to !== "any" && r.applies_to !== buying) return { error: "That discount code is for something else." };
  return { code, percent: r.percent as number };
}

export async function countCodeUse(code: string) {
  await db()`UPDATE discount_codes SET uses = uses + 1 WHERE code = ${code}`;
}

/** Whether this person (or organisation) has bought anything before, for the launch offer. */
export async function hasBought(who: { learner?: string; org?: string }) {
  const [r] = who.org
    ? await db()`SELECT 1 FROM purchases WHERE org_id = ${who.org} LIMIT 1`
    : await db()`SELECT 1 FROM purchases WHERE learner_id = ${who.learner ?? ""} LIMIT 1`;
  return Boolean(r);
}

export type Quote = { base: number; percent: number; reason: "launch" | "sale" | "code" | null; code: string | null; total: number; currency: string };

/** The price after the biggest discount available: a code, a sale, or the launch offer. */
export async function quote(
  base: { amount: number; currency: string },
  buying: Buying,
  who: { learner?: string; org?: string },
  rawCode?: unknown,
): Promise<Quote | Fail> {
  const [o, code, bought] = await Promise.all([offers(), checkCode(rawCode, buying), hasBought(who)]);
  if (code && "error" in code) return code;
  const options: { percent: number; reason: Quote["reason"]; code: string | null }[] = [];
  if (code) options.push({ percent: code.percent, reason: "code", code: code.code });
  if (o.salePercent && o.saleEndsAt && new Date(o.saleEndsAt) > new Date()) options.push({ percent: o.salePercent, reason: "sale", code: null });
  if (o.launchOn && !bought) options.push({ percent: o.launchPercent, reason: "launch", code: null });
  const best = options.sort((a, b) => b.percent - a.percent)[0] ?? { percent: 0, reason: null, code: null };
  const total = Math.round((base.amount * (100 - best.percent)) / 100);
  return { base: base.amount, percent: best.percent, reason: best.reason, code: best.code, total, currency: base.currency };
}

/** "$24.50" from 2450 and "usd". */
export function money(amount: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}
