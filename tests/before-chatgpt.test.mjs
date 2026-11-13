import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { exploreGuides } from "../src/content/explore-guides.ts";
import {
  builtLessons,
  getBuiltLesson,
  getPreviewLesson,
} from "../src/content/preview-lessons.ts";
import { parseCheckpoint } from "../src/lib/learning-state.ts";

const slug = "before-chatgpt";
const root = new URL("../public/lessons/before-chatgpt/", import.meta.url);
const story = JSON.parse(readFileSync(new URL("narration.json", root), "utf8"));
const script = JSON.parse(
  readFileSync(new URL("../animation/before-chatgpt-script.json", import.meta.url), "utf8"),
);
const noEmDash = (text) => assert.ok(!text.includes("—"), `No em dash: ${text}`);

test("Lesson 3 narration follows the approved script, scene by scene", () => {
  assert.deepEqual(story.scenes.map((s) => s.id), [
    "surprise",
    "early-questions",
    "rules",
    "new-challenges",
    "chatgpt",
    "bigger-picture",
  ]);
  assert.deepEqual(story.cues.map((c) => c.text), script.scenes.flatMap((s) => s.lines));
  assert.ok(story.duration < 8 * 60, "lessons stay under eight minutes");
  assert.ok(story.cues[0].start < 1, "the voice starts within the first second");
  for (const scene of story.scenes) {
    assert.ok(scene.start < scene.end);
    for (const cue of story.cues.filter((c) => c.scene === scene.id)) {
      assert.ok(cue.start >= scene.start && cue.end <= scene.end, cue.text);
    }
  }
});

test("Lesson 3 captions match every spoken line in time order", () => {
  const vtt = readFileSync(new URL("captions.vtt", root), "utf8");
  assert.ok(vtt.startsWith("WEBVTT"));
  story.cues.forEach((cue, index) => {
    assert.ok(cue.start < cue.end && cue.end <= story.duration);
    if (index) assert.ok(cue.start >= story.cues[index - 1].end);
    assert.ok(vtt.includes(cue.text));
    noEmDash(cue.text);
  });
});

test("Lesson 3 desktop and phone films contain audio and pictures", () => {
  for (const suffix of ["", "-mobile"]) {
    const video = readFileSync(new URL(`story${suffix}.mp4`, root));
    assert.equal(video.toString("ascii", 4, 8), "ftyp");
    assert.ok(video.includes(Buffer.from("soun")), "MP4 audio stream is present");
    assert.ok(video.length > 100000);
    assert.equal(readFileSync(new URL(`poster${suffix}.jpg`, root)).readUInt16BE(), 0xffd8);
  }
  assert.ok(readFileSync(new URL("narration.mp3", root)).length > 100000);
});

test("Lesson 3 is built and open without an account, with sources and a six-step guide", () => {
  const lesson = getBuiltLesson(slug);
  assert.ok(lesson);
  assert.equal(lesson.preview, true);
  assert.equal(getPreviewLesson(slug), lesson, "all of Module 1 is open");
  assert.equal(builtLessons.filter((l) => l.preview).length, builtLessons.length);
  assert.ok(lesson.sources.length >= 4);
  for (const source of lesson.sources) {
    assert.equal(new URL(source.url).protocol, "https:");
    noEmDash(source.claim);
  }
  const guide = exploreGuides[slug];
  assert.equal(guide.steps.length, 6);
  for (const step of guide.steps) {
    assert.ok(step.reading.length >= 2);
    [step.title, step.goal, step.takeaway, ...step.reading].forEach(noEmDash);
  }
  guide.reflections.forEach(noEmDash);
});

test("a Lesson 3 saved place is accepted and an overlong film position is not", () => {
  const place = {
    version: 1,
    route: "explore",
    step: 2,
    visited: ["time-1950", "time-1956"],
    activities: { "time-rules": { items: ["paper", "jam", "end-stuck"], revised: true } },
    videoTime: 120,
  };
  assert.deepEqual(parseCheckpoint(place, slug), place);
  assert.equal(parseCheckpoint({ ...place, videoTime: 400 }, slug), null);
  assert.equal(parseCheckpoint({ ...place, visited: ["day-map"] }, slug), null);
});
