import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { parseCheckpoint, emptyCheckpoint } from "../src/lib/learning-state.ts";
import { scoreAssessment } from "../src/lib/assessment-scoring.ts";
import { assessmentBank } from "../src/server/assessment-bank.ts";
import { exploreGuides } from "../src/content/explore-guides.ts";
import { learningIdentityCallbacks } from "../src/lib/auth-callbacks.ts";
test("Google learning identity stays stable across sign-ins and ignores client profile updates", async () => {
  const first = await learningIdentityCallbacks.jwt({
    token: { sub: "temporary-user-1" },
    account: {
      provider: "google",
      providerAccountId: "verified-google-account",
    },
  });
  const second = await learningIdentityCallbacks.jwt({
    token: { sub: "temporary-user-2" },
    account: {
      provider: "google",
      providerAccountId: "verified-google-account",
    },
  });
  assert.equal(first.learnerId, second.learnerId);
  assert.equal(first.learnerId, "google:verified-google-account");
  const updated = await learningIdentityCallbacks.jwt({
    token: first,
    trigger: "update",
    session: { learnerId: "someone-else" },
  });
  assert.equal(updated.learnerId, first.learnerId);
  const legacy = await learningIdentityCallbacks.session({
    session: { user: { name: "Existing learner" } },
    token: { sub: "old-unstable-id" },
  });
  assert.equal(legacy.user.id, undefined);
});
test("knowledge checks score 6/10 as fail and 7/10 as pass", () => {
  for (const questions of Object.values(assessmentBank)) {
    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map((q) => q.id)).size, 10);
    for (const count of [0, 6, 7, 10]) {
      const answers = Object.fromEntries(
        questions.map((q, i) => [
          q.id,
          i < count ? q.correct : q.options.find((o) => o.id !== q.correct).id,
        ]),
      );
      const result = scoreAssessment(questions, answers);
      assert.equal(result.correct, count);
      assert.equal(result.passed, count >= 7);
      assert.equal(result.feedback.length, 10);
    }
    assert.throws(() => scoreAssessment(questions, {}));
    assert.throws(() =>
      scoreAssessment(questions, {
        ...Object.fromEntries(questions.map((q) => [q.id, q.correct])),
        score: 100,
      }),
    );
  }
});
test("unscored checkpoints reject pass flags, private notes, invalid steps and oversized fields", () => {
  const base = emptyCheckpoint();
  assert.deepEqual(parseCheckpoint(base, "what-counts-as-ai"), base);
  for (const value of [
    { ...base, passed: true },
    { ...base, score: 100 },
    { ...base, step: 99 },
    { ...base, videoTime: NaN },
    { ...base, activities: { reflect: { notes: "Private note" } } },
    { ...base, activities: { meet: { selection: "x".repeat(101) } } },
  ])
    assert.equal(parseCheckpoint(value, "what-counts-as-ai"), null);
  assert.equal(parseCheckpoint(base, "unknown"), null);
});
test("both guides have complete explanations and no em dashes", () => {
  assert.equal(exploreGuides["what-counts-as-ai"].steps.length, 8);
  assert.equal(exploreGuides["ai-in-your-day"].steps.length, 7);
  for (const guide of Object.values(exploreGuides))
    for (const step of guide.steps) {
      assert.ok(step.reading.join(" ").length > 250);
      assert.ok(step.takeaway.length > 15);
      assert.ok(!JSON.stringify(step).includes("\u2014"));
    }
});
test("Lesson 1 uses the latest supplied recording and Lesson 2 recording is preserved", () => {
  const assets = JSON.parse(
    readFileSync(new URL("../animation/assets.json", import.meta.url)),
  );
  for (const item of [assets.narration, assets.foundationsNarration])
    assert.equal(
      createHash("sha256")
        .update(readFileSync(new URL("../" + item.path, import.meta.url)))
        .digest("hex"),
      item.sha256,
    );
  assert.equal(
    assets.narration.sha256,
    "a2cb24cf8aa7190c05c951fe6a1329e8c15ea15d26ce7f445f76675cb35a0fe3",
  );
});
test("new Lesson 1 film has six scenes, aligned captions and audio in both sizes", () => {
  const root = new URL("../public/lessons/what-is-ai/", import.meta.url),
    story = JSON.parse(readFileSync(new URL("narration.json", root))),
    script = JSON.parse(
      readFileSync(
        new URL("../animation/foundations-script.json", import.meta.url),
      ),
    );
  assert.equal(story.scenes.length, 6);
  assert.ok(story.duration <= 480);
  assert.deepEqual(
    story.cues.map((c) => c.text),
    script.scenes.flatMap((s) => s.lines),
  );
  const captions = readFileSync(new URL("captions.vtt", root), "utf8");
  story.cues.forEach((cue, i) => {
    assert.ok(cue.start < cue.end && cue.end <= story.duration);
    if (i) assert.ok(cue.start >= story.cues[i - 1].end);
    assert.ok(captions.includes(cue.text));
  });
  for (const suffix of ["", "-mobile"]) {
    const mp4 = readFileSync(new URL(`story${suffix}.mp4`, root));
    assert.equal(mp4.toString("ascii", 4, 8), "ftyp");
    assert.ok(mp4.includes(Buffer.from("soun")));
  }
});
