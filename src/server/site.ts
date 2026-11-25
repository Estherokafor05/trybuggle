// The address of this site, for links that leave it (certificate verification,
// LinkedIn). Set SITE_URL once Buggle Learn has its own domain.
import { headers } from "next/headers";

const fallback = "https://trybuggle.vercel.app";
const trusted = /^(trybuggle\.vercel\.app|[a-z0-9-]+\.vercel\.app|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/i;

export async function siteOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host") ?? "";
  if (!trusted.test(host)) return fallback;
  const local = /^(localhost|127\.0\.0\.1)/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}

export const verifyPath = (code: string) => `/verify/${encodeURIComponent(code)}`;
