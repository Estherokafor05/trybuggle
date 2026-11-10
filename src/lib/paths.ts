const SITE_ORIGIN = "https://buggle.example";

export function safeReturnPath(value: string | undefined): string {
  if (!value) return "/modules/ai-foundations";

  try {
    const target = new URL(value, SITE_ORIGIN);
    if (target.origin !== SITE_ORIGIN) return "/modules/ai-foundations";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/modules/ai-foundations";
  }
}
