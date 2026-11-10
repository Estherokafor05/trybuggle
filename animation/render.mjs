import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import path from "node:path";
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, "../public/lessons/maya-journey");
const serveUrl = await bundle({
  entryPoint: path.join(here, "src/index.ts"),
  publicDir: path.resolve(here, "../public"),
});
const compositions = await getCompositions(serveUrl);
for (const mobile of [false, true]) {
  const composition = compositions.find(
    (c) => c.id === (mobile ? "MayaJourneyMobile" : "MayaJourney"),
  );
  const suffix = mobile ? "-mobile" : "";
  console.log("Rendering " + composition.id);
  let last = -1;
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: path.join(out, "story" + suffix + ".mp4"),
    concurrency: 2,
    crf: 23,
    onProgress: ({ progress }) => {
      const n = Math.floor(progress * 10);
      if (n > last) {
        console.log(composition.id + " " + n * 10 + "%");
        last = n;
      }
    },
  });
  const frames = [150, 570, 1000, 1200, 1380, 1620];
  for (let i = 0; i < frames.length; i++)
    await renderStill({
      composition,
      serveUrl,
      output: path.join(out, `step-${i + 1}${suffix}.jpg`),
      frame: frames[i],
      imageFormat: "jpeg",
      jpegQuality: 85,
    });
  await renderStill({
    composition,
    serveUrl,
    output: path.join(out, "poster" + suffix + ".jpg"),
    frame: 150,
    imageFormat: "jpeg",
    jpegQuality: 85,
  });
}
console.log("Both videos and all keyframes are ready.");
