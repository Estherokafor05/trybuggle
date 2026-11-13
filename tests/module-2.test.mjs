import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { exploreGuides } from "../src/content/explore-guides.ts";
import { getBuiltLesson } from "../src/content/preview-lessons.ts";
import { parseCheckpoint } from "../src/lib/learning-state.ts";
import { passMark, scoreAssessment } from "../src/lib/assessment-scoring.ts";

const noEmDash = (text) => assert.ok(!text.includes("—"), `No em dash: ${text}`);
const episodes = [
  { slug: "a-new-helper", label: "2.1", steps: 5, place: { step: 2, visited: ["chat-busy", "chat-ask"], activities: { "chat-check": { matches: { q: "fifty" }, revised: true } } } },
  { slug: "the-email-that-said-nothing", label: "2.2", steps: 5, place: { step: 2, visited: ["email-first", "email-missing"], activities: { "email-build": { matches: { who: "leaders" }, stage: 1 } } } },
  { slug: "three-tries-at-the-flyer", label: "2.3", steps: 5, place: { step: 2, visited: ["flyer-first", "flyer-next"], activities: { "flyer-tone": { matches: { q: "neighbour" }, stage: 1 } } } },
];
for (const episode of episodes) {
  const { slug, label } = episode;
  const root = new URL(`../public/lessons/${slug}/`, import.meta.url);
  const story = JSON.parse(readFileSync(new URL("narration.json", root), "utf8"));
  const script = JSON.parse(readFileSync(new URL(`../animation/${slug}-script.json`, import.meta.url), "utf8"));

  test(`Episode ${label} captions follow the recording, under eight minutes`, () => {
    assert.deepEqual(story.cues.map((c) => c.text), script.scenes.flatMap((s) => s.lines));
    assert.ok(story.duration < 8 * 60);
    const vtt = readFileSync(new URL("captions.vtt", root), "utf8");
    story.cues.forEach((cue, i) => {
      assert.ok(cue.start < cue.end && cue.end <= story.duration);
      if (i) assert.ok(cue.start >= story.cues[i - 1].end);
      assert.ok(vtt.includes(cue.text));
      noEmDash(cue.text);
      assert.ok(!/\[[a-z ]+\]/i.test(cue.text), "delivery tags are not shown as captions");
    });
  });

  test(`Episode ${label} desktop and phone films contain audio and pictures`, () => {
    for (const suffix of ["", "-mobile"]) {
      const video = readFileSync(new URL(`story${suffix}.mp4`, root));
      assert.equal(video.toString("ascii", 4, 8), "ftyp");
      assert.ok(video.includes(Buffer.from("soun")));
    }
  });

  test(`Episode ${label} is open to everyone, with a guide and a saved place`, () => {
    const lesson = getBuiltLesson(slug);
    assert.ok(lesson && lesson.preview);
    lesson.sources.forEach((s) => assert.equal(new URL(s.url).protocol, "https:"));
    const guide = exploreGuides[slug];
    assert.equal(guide.steps.length, episode.steps);
    for (const step of guide.steps) {
      assert.ok(step.reading.length >= 2);
      [step.title, step.goal, step.takeaway, ...step.reading].forEach(noEmDash);
    }
    const place = { version: 1, route: "explore", videoTime: 40, ...episode.place };
    assert.deepEqual(parseCheckpoint(place, slug), place);
    assert.equal(parseCheckpoint({ ...place, videoTime: story.duration + 30 }, slug), null);
  });
}

test("5-question checks pass with 4 correct", () => {
  assert.equal(passMark(5), 4);
  const five = Array.from({ length: 5 }, (_, i) => ({ id: `q${i}`, prompt: "Q", options: [{ id: "0", text: "a" }, { id: "1", text: "b" }], correct: "0", explanation: "E" }));
  const answers = (n) => Object.fromEntries(five.map((q, i) => [q.id, i < n ? "0" : "1"]));
  assert.equal(scoreAssessment(five, answers(4), 5).passed, true);
  assert.equal(scoreAssessment(five, answers(3), 5).passed, false);
});
