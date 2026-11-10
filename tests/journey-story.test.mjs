import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  JOURNEY_DURATION,
  journeyChapters,
  journeyEstimate,
  chapterAt,
} from "../src/content/journey-story.ts";
const base = new URL("../public/lessons/maya-journey/", import.meta.url);
test("traffic changes the useful estimate while the alternative remains the same", () => {
  assert.deepEqual(journeyEstimate("light"), {
    usual: 15,
    alternative: 20,
    recommended: "usual",
  });
  assert.deepEqual(journeyEstimate("heavy"), {
    usual: 30,
    alternative: 20,
    recommended: "alternative",
  });
});
test("seeking across chapter boundaries selects the corresponding visual explanation", () => {
  assert.equal(chapterAt(0), 0);
  assert.equal(chapterAt(8.999), 0);
  assert.equal(chapterAt(9), 1);
  for (const [index, c] of journeyChapters.entries()) {
    assert.equal(chapterAt(c.at), index);
    assert.ok(
      c.at <= c.still &&
        c.still < (journeyChapters[index + 1]?.at ?? JOURNEY_DURATION),
    );
    assert.ok(c.description.length > 30);
  }
  assert.equal(chapterAt(JOURNEY_DURATION), 5);
});
test("recorded captions fit the timeline and have matching WebVTT cues", () => {
  const { duration, cues } = JSON.parse(
    readFileSync(new URL("narration.json", base), "utf8"),
  );
  const vtt = readFileSync(new URL("captions.vtt", base), "utf8");
  assert.equal(duration, JOURNEY_DURATION);
  assert.ok(vtt.startsWith("WEBVTT"));
  cues.forEach((c, i) => {
    assert.ok(c.start < c.end && c.end <= duration);
    if (i) assert.ok(c.start >= cues[i - 1].end);
    assert.ok(vtt.includes(c.text));
    assert.ok(!c.text.includes("\u2014"));
  });
});
test("both video layouts and equivalent self-paced keyframes are bundled", () => {
  for (const suffix of ["", "-mobile"]) {
    const video = readFileSync(new URL(`story${suffix}.mp4`, base));
    assert.equal(video.toString("ascii", 4, 8), "ftyp");
    assert.ok(video.length > 100000);
    for (let i = 1; i <= 6; i++) {
      const img = readFileSync(new URL(`step-${i}${suffix}.jpg`, base));
      assert.equal(img.readUInt16BE(), 0xffd8);
    }
    assert.ok(existsSync(new URL(`poster${suffix}.jpg`, base)));
  }
});
