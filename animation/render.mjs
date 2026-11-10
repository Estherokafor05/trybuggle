import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import narration from "../public/lessons/maya-day/narration.json" with { type: "json" };
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../public/lessons/maya-day");
const review = "/private/tmp/maya-day-review";
await mkdir(review, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(here, "src/index.ts"),
  publicDir: path.resolve(here, "../public"),
});
const compositions = await getCompositions(serveUrl);
for (const mobile of [false, true]) {
  const composition = compositions.find(c => c.id === (mobile ? "MayaDayMobile" : "MayaDay"));
  if (!composition) throw new Error("Missing Remotion composition");
  const suffix = mobile ? "-mobile" : "";
  let last = -1;
  console.log("Rendering " + composition.id);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: path.join(out, "story" + suffix + ".mp4"),
    concurrency: 2,
    crf: 23,
    onProgress: ({ progress }) => {
      const n = Math.floor(progress * 10);
      if (n > last) { console.log(composition.id + " " + n * 10 + "%"); last = n; }
    },
  });
  await renderStill({
    composition, serveUrl,
    output: path.join(out, "poster" + suffix + ".jpg"),
    frame: 3 * 24, imageFormat: "jpeg", jpegQuality: 85,
  });
  for (const scene of narration.scenes) {
    await renderStill({
      composition, serveUrl,
      output: path.join(review, scene.id + suffix + ".jpg"),
      frame: Math.min(composition.durationInFrames - 1, Math.round((scene.end - 2) * 24)),
      imageFormat: "jpeg", jpegQuality: 84,
    });
  }
}
console.log("Both narrated films, posters and review frames are ready.");
