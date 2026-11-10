import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { safeReturnPath } from "../src/lib/paths.ts";
import { foundationScenes } from "../src/content/foundations-walkthrough.ts";
import { previewLessons, getPreviewLesson } from "../src/content/preview-lessons.ts";

test("sign-in preserves a local lesson destination", () => {
  const path = "/modules/ai-foundations/lessons/ai-in-your-day?format=guide#guide";
  assert.equal(safeReturnPath(path), path);
});

test("sign-in cannot redirect learners to a different site", () => {
  for (const path of [undefined, "https://example.net", "//example.net", "\\\\example.net", "javascript:alert(1)", "https://buggle.example@example.net"]) {
    assert.equal(safeReturnPath(path), "/modules/ai-foundations");
  }
});

test("every narrated scene has bundled audio and ordered descriptive cues", () => {
  assert.equal(new Set(foundationScenes.map((scene) => scene.id)).size, 6);
  for (const scene of foundationScenes) {
    assert.ok(existsSync(new URL(`../public${scene.audioSrc}`, import.meta.url)), scene.audioSrc);
    assert.equal(scene.cues[0].at, 0);
    scene.cues.forEach((cue, index) => {
      assert.ok(cue.text.trim() && cue.visual.trim());
      assert.ok(cue.at < scene.duration);
      if (index) assert.ok(cue.at > scene.cues[index - 1].at);
    });
  }
});

test("only prepared preview lessons resolve and both have independent guides", () => {
  assert.equal(previewLessons.length, 2);
  for (const lesson of previewLessons) {
    assert.equal(getPreviewLesson(lesson.slug), lesson);
    assert.ok(lesson.guideSteps.length >= 3);
  }
  assert.equal(getPreviewLesson("not-a-lesson"), undefined);
});
