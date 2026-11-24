const SITE_ORIGIN = "https://buggle.example";
const FALLBACK = "/modules/ai-foundations";
/** Pages a learner should never be sent back to after signing in (they would loop). */
const AUTH_PAGES = /^\/(sign-in|sign-up|forgot-password|reset-password)(\/|$)/;

export function safeReturnPath(value: string | undefined): string {
  if (!value) return FALLBACK;

  try {
    const target = new URL(value, SITE_ORIGIN);
    if (target.origin !== SITE_ORIGIN) return FALLBACK;
    if (AUTH_PAGES.test(target.pathname)) return FALLBACK;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return FALLBACK;
  }
}
