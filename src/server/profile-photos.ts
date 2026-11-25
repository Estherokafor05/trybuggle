// Profile photos: stored small, served from /api/avatars/<id>, and linked from
// the learner's account (auth_user.image) so the header and forum can show them.
import { db } from "./database";

const MAX = 300_000;
const MAGIC: [string, number[]][] = [
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]],
];

export const avatarPath = (id: string) => `/api/avatars/${id}`;

/** Checks and saves a photo. Returns its address, or what was wrong. */
export async function savePhoto(user: string, file: unknown): Promise<{ image: string } | { error: string }> {
  if (!(file instanceof File) || file.size === 0) return { error: "PHOTO_MISSING" };
  if (file.size > MAX) return { error: "PHOTO_TOO_BIG" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = MAGIC.find(([, m]) => m.every((x, i) => bytes[i] === x))?.[0];
  if (!type || (type === "image/webp" && String.fromCharCode(...bytes.slice(8, 12)) !== "WEBP")) return { error: "PHOTO_TYPE" };
  const [row] = await db()`INSERT INTO profile_photos(user_id, bytes, type) VALUES(${user}, ${bytes}, ${type})
    ON CONFLICT (user_id) DO UPDATE SET id = gen_random_uuid(), bytes = EXCLUDED.bytes, type = EXCLUDED.type, updated_at = now()
    RETURNING id`;
  return { image: avatarPath(row.id as string) };
}

export async function removePhoto(user: string) {
  await db()`DELETE FROM profile_photos WHERE user_id = ${user}`;
}

export async function photo(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db()`SELECT bytes, type FROM profile_photos WHERE id = ${id}`;
  return row ? { bytes: row.bytes as Uint8Array, type: row.type as string } : null;
}
