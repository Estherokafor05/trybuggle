import { auth } from "@/auth";
export async function learnerId() {
  return (await auth())?.user?.id ?? null;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
export async function smallJSON(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new Error("Invalid content type");
  if (Number(request.headers.get("content-length")) > 18000)
    throw new Error("Too large");
  const text = await request.text();
  if (text.length > 18000) throw new Error("Too large");
  return JSON.parse(text);
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
