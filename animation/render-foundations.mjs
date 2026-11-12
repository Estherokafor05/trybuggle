import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";
const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(here, "../public/lessons/what-is-ai");
const review = "/private/tmp/buggle-foundations-review";
await mkdir(review, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(here, "src/index.ts"),
  publicDir: path.resolve(here, "../public"),
});
const all = await getCompositions(serveUrl);
for (const mobile of [false, true]) {
  const composition = all.find(
    (c) => c.id === (mobile ? "WhatIsAIMobile" : "WhatIsAI"),
  );
  if (!composition) throw new Error("Missing composition");
  const suffix = mobile ? "-mobile" : "";
  for (const t of [
    4, 17, 30, 40, 55, 72, 88, 106, 117, 136, 151, 166, 183, 202, 232,
  ]) {
    await renderStill({
      composition,
      serveUrl,
      output: path.join(review, `${t}${suffix}.jpg`),
      frame: Math.round(t * 24),
      imageFormat: "jpeg",
      jpegQuality: 82,
    });
  }
  if (process.argv.includes("--stills")) continue;
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: path.join(output, `story${suffix}.mp4`),
    concurrency: 2,
    crf: 23,
    onProgress: ({ progress }) => {
      const current = Math.floor(progress * 10);
      if (current > last) {
        console.log(composition.id, current * 10 + "%");
        last = current;
      }
    },
  });
  await renderStill({
    composition,
    serveUrl,
    output: path.join(output, `poster${suffix}.jpg`),
    frame: 30 * 24,
    imageFormat: "jpeg",
    jpegQuality: 85,
  });
}
console.log("Foundations render complete");
