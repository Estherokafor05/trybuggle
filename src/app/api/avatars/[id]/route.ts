import { photo } from "@/server/profile-photos";

// A learner's profile photo. Each upload gets a new address, so it can be cached.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await photo(id).catch(() => null);
  if (!image) return new Response(null, { status: 404 });
  return new Response(Buffer.from(image.bytes), {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
