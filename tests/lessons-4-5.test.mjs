import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { exploreGuides } from "../src/content/explore-guides.ts";
import { getBuiltLesson, getPreviewLesson } from "../src/content/preview-lessons.ts";
import { parseCheckpoint } from "../src/lib/learning-state.ts";

const noEmDash = (text) => assert.ok(!text.includes("—"), `No em dash: ${text}`);
const lessons = [
  { slug: "ai-or-software", scenes: ["is-everything-ai", "reminder", "check-in", "smart-inbox", "wrong-prediction", "difference"], firstStep: "rec-desk" },
  { slug: "what-ai-can-do", scenes: ["busy-week", "starting-point", "needs-checking", "privacy", "who-decides", "in-charge"], firstStep: "hr-brief" },
];

for (const { slug, scenes, firstStep } of lessons) {
  const root = new URL(`../public/lessons/${slug}/`, import.meta.url);
  const story = JSON.parse(readFileSync(new URL("narration.json", root), "utf8"));
  const script = JSON.parse(readFileSync(new URL(`../animation/${slug}-script.json`, import.meta.url), "utf8"));

  test(`${slug}: captions follow the recorded script, scene by scene`, () => {
    assert.deepEqual(story.scenes.map((s) => s.id), scenes);
    assert.deepEqual(story.cues.map((c) => c.text), script.scenes.flatMap((s) => s.lines));
    assert.ok(story.duration < 8 * 60);
    assert.ok(story.cues[0].start < 1);
    const vtt = readFileSync(new URL("captions.vtt", root), "utf8");
    story.cues.forEach((cue, i) => {
      assert.ok(cue.start < cue.end && cue.end <= story.duration);
      if (i) assert.ok(cue.start >= story.cues[i - 1].end);
      assert.ok(vtt.includes(cue.text));
      noEmDash(cue.text);
    });
  });

  test(`${slug}: desktop and phone films contain audio and pictures`, () => {
    for (const suffix of ["", "-mobile"]) {
      const video = readFileSync(new URL(`story${suffix}.mp4`, root));
      assert.equal(video.toString("ascii", 4, 8), "ftyp");
      assert.ok(video.includes(Buffer.from("soun")));
      assert.equal(readFileSync(new URL(`poster${suffix}.jpg`, root)).readUInt16BE(), 0xffd8);
    }
  });

  test(`${slug}: built, behind sign-in, with sources and a six-step guide`, () => {
    const lesson = getBuiltLesson(slug);
    assert.ok(lesson && !lesson.preview);
    assert.equal(getPreviewLesson(slug), undefined);
    assert.ok(lesson.sources.length >= 3);
    lesson.sources.forEach((s) => assert.equal(new URL(s.url).protocol, "https:"));
    const guide = exploreGuides[slug];
    assert.equal(guide.steps.length, 6);
    for (const step of guide.steps) {
      assert.ok(step.reading.length >= 2);
      [step.title, step.goal, step.takeaway, ...step.reading].forEach(noEmDash);
    }
    const place = { version: 1, route: "explore", step: 1, visited: [firstStep], activities: { [firstStep]: { stage: 1 } }, videoTime: 30 };
    assert.deepEqual(parseCheckpoint(place, slug), place);
    assert.equal(parseCheckpoint({ ...place, videoTime: story.duration + 60 }, slug), null);
  });
}
