/**
 * Copies an early-access sign-up into the team's Google Sheet, through a small
 * Apps Script web app (see scripts/waitlist-sheet.gs). The database stays the
 * source of truth: if the sheet is not set up or does not answer, the sign-up
 * is still saved and the learner still sees success.
 *
 * Needs WAITLIST_SHEET_URL (the web app URL) and WAITLIST_SHEET_SECRET (the
 * same value as SECRET in the Apps Script). Never log either.
 */
export interface SheetRow {
  list: string;
  email: string;
  role: string;
  newSignup: boolean;
}

export async function sendToSheet(row: SheetRow): Promise<void> {
  const url = process.env.WAITLIST_SHEET_URL;
  const secret = process.env.WAITLIST_SHEET_SECRET;
  if (!url || !secret) return;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, ...row, at: new Date().toISOString() }),
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    if (!result?.ok) console.error("[waitlist] Google Sheet did not accept the sign-up.");
  } catch {
    console.error("[waitlist] Could not reach the Google Sheet.");
  }
}
