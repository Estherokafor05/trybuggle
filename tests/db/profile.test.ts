// Profile photos and how names show in small spaces.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { initials, shortName } from "../../src/lib/people";

const migrations = new URL("../../migrations/", import.meta.url);
const port = 63000 + Math.floor(Math.random() * 1000);
let db: PGlite;
let server: PGLiteSocketServer;
let photos: typeof import("../../src/server/profile-photos");

before(async () => {
  db = await PGlite.create();
  for (const file of (await readdir(migrations)).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections: 10 });
  await server.start();
  process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${port}/postgres?sslmode=disable`;
  process.env.DATABASE_POOL_MAX = "1";
  photos = await import("../../src/server/profile-photos");
});
after(async () => {
  await server.stop();
  await db.close();
  setImmediate(() => process.exit(process.exitCode ?? 0));
});

test("names: first name and last initial, and up to two initials", () => {
  assert.equal(shortName("Esther Okafor"), "Esther O.");
  assert.equal(shortName("  Ngozi Peace Okafor "), "Ngozi O.");
  assert.equal(shortName("Madonna"), "Madonna");
  assert.equal(shortName("ada ëze"), "ada Ë.");
  assert.equal(shortName(""), "");
  assert.equal(initials("Esther Okafor"), "EO");
  assert.equal(initials("Madonna"), "M");
  assert.equal(initials(null), "?");
});

test("photos are checked, replaced with a new address, and removed", async () => {
  const user = randomUUID();
  await db.query(`INSERT INTO auth_user(id, name, email, "emailVerified") VALUES($1, 'P', $2, true)`, [user, `${user}@example.com`]);
  const fake = new File([new TextEncoder().encode("<svg onload=alert(1)>")], "x.jpg", { type: "image/jpeg" });
  assert.deepEqual(await photos.savePhoto(user, fake), { error: "PHOTO_TYPE" });
  const riffNotWebp = new File([new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20])], "x.webp");
  assert.deepEqual(await photos.savePhoto(user, riffNotWebp), { error: "PHOTO_TYPE" });
  assert.deepEqual(await photos.savePhoto(user, new File([new Uint8Array(300_001)], "big.jpg")), { error: "PHOTO_TOO_BIG" });
  const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])], "me.jpg");
  const first = await photos.savePhoto(user, jpeg);
  const second = await photos.savePhoto(user, jpeg);
  assert.ok("image" in first && "image" in second);
  assert.notEqual(first.image, second.image, "a new photo gets a new address");
  assert.equal(await photos.photo(first.image.split("/").at(-1)!), null);
  assert.equal((await photos.photo(second.image.split("/").at(-1)!))?.type, "image/jpeg");
  await photos.removePhoto(user);
  assert.equal(await photos.photo(second.image.split("/").at(-1)!), null);
});
