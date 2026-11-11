import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const root = new URL("../public/lessons/maya-day/", import.meta.url);
const story = JSON.parse(readFileSync(new URL("narration.json", root), "utf8"));
const script = JSON.parse(readFileSync(new URL("../animation/day-script.json", import.meta.url), "utf8"));

test("one Maya story follows the six approved everyday moments", () => {
  assert.deepEqual(story.scenes.map(s => s.id), ["morning", "photos", "journey", "shopping", "messages", "recap"]);
  assert.ok(story.duration < 8 * 60);
  assert.ok(story.cues[0].start < 1, "the voice starts within the first second");
  assert.deepEqual(story.cues.map(c => c.text), script.scenes.flatMap(s => s.lines));
  for (const scene of story.scenes) {
    assert.ok(scene.start < scene.end);
    assert.ok(scene.description.length > 50);
    assert.ok(story.cues.some(c => c.scene === scene.id));
    for (const time of Object.values(story.beats[scene.id])) {
      assert.ok(time >= scene.start && time < scene.end, "visual beats stay inside their scene");
    }
  }
});
test("captions match every spoken line in time order", () => {
  const vtt = readFileSync(new URL("captions.vtt", root), "utf8");
  assert.ok(vtt.startsWith("WEBVTT"));
  story.cues.forEach((cue, index) => {
    assert.ok(cue.start < cue.end && cue.end <= story.duration);
    if (index) assert.ok(cue.start >= story.cues[index - 1].end);
    assert.ok(vtt.includes(cue.text));
    assert.ok(!cue.text.includes("\u2014"));
  });
});
test("desktop and phone films contain audio and visual media", () => {
  for (const suffix of ["", "-mobile"]) {
    const video = readFileSync(new URL(`story${suffix}.mp4`, root));
    assert.equal(video.toString("ascii", 4, 8), "ftyp");
    assert.ok(video.includes(Buffer.from("soun")), "MP4 audio stream is present");
    assert.ok(video.length > 100000);
    const poster = readFileSync(new URL(`poster${suffix}.jpg`, root));
    assert.equal(poster.readUInt16BE(), 0xffd8);
  }
  assert.ok(readFileSync(new URL("narration.mp3", root)).length > 100000);
  assert.ok(readFileSync(new URL("gallery-contact-sheet.png", root)).length > 100000);
  assert.ok(readFileSync(new URL("hallway.png", root)).length > 100000);
  assert.ok(readFileSync(new URL("community-centre.png", root)).length > 100000);
});
