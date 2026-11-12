import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import narration from "../public/lessons/before-chatgpt/narration.json" with { type: "json" };
// Usage: node render-before-chatgpt.mjs [--stills <review-dir>]
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../public/lessons/before-chatgpt");
const stillsAt = process.argv.indexOf("--stills");
const review = stillsAt > 0 ? process.argv[stillsAt + 1] : null;
const serveUrl = await bundle({
  entryPoint: path.join(here, "src/index.ts"),
  publicDir: path.resolve(here, "../public"),
});
const compositions = await getCompositions(serveUrl);
for (const mobile of [false, true]) {
  const composition = compositions.find((c) => c.id === (mobile ? "BeforeChatGPTMobile" : "BeforeChatGPT"));
  if (!composition) throw new Error("Missing Remotion composition");
  const suffix = mobile ? "-mobile" : "";
  if (review) {
    await mkdir(review, { recursive: true });
    // One frame shortly after every sentence starts, so each beat can be reviewed.
    for (const cue of narration.cues) {
      await renderStill({
        composition, serveUrl,
        output: path.join(review, `${String(cue.index).padStart(2, "0")}-${cue.scene}${suffix}.jpg`),
        frame: Math.min(composition.durationInFrames - 1, Math.round((cue.end - 0.2) * 24)),
        imageFormat: "jpeg", jpegQuality: 70,
      });
    }
    continue;
  }
  let last = -1;
  console.log("Rendering " + composition.id);
  await renderMedia({
    composition, serveUrl, codec: "h264",
    outputLocation: path.join(out, "story" + suffix + ".mp4"),
    concurrency: 2, crf: 23,
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
}
console.log(review ? "Review stills ready." : "Both narrated films and posters are ready.");
