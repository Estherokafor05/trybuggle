import test from "node:test";
import assert from "node:assert/strict";
import { passMark, scoreAssessment } from "../src/lib/assessment-scoring.ts";
import { certificatePdf, unprintableCharacters } from "../src/server/certificate-pdf.ts";

const question = (id) => ({
  id,
  prompt: "Q",
  options: [
    { id: "0", text: "right" },
    { id: "1", text: "wrong" },
  ],
  correct: "0",
  explanation: "E",
});

test("70% pass mark: 7 of 10 for lesson checks, 6 of 8 for the final assessment", () => {
  assert.equal(passMark(10), 7);
  assert.equal(passMark(8), 6);
  const eight = Array.from({ length: 8 }, (_, i) => question(`q${i}`));
  const answers = (correct) => Object.fromEntries(eight.map((q, i) => [q.id, i < correct ? "0" : "1"]));
  assert.equal(scoreAssessment(eight, answers(6), 8).passed, true);
  assert.equal(scoreAssessment(eight, answers(5), 8).passed, false);
  assert.equal(scoreAssessment(eight, answers(6), 8).score, 75);
  assert.throws(() => scoreAssessment(eight, answers(8)), /Answer every question/);
});

test("the certificate PDF prints names in many alphabets and flags unsupported characters", async () => {
  assert.deepEqual(await unprintableCharacters("Chidiebere Okafor-Núñez"), []);
  assert.deepEqual(await unprintableCharacters("Ελένη Иванова"), []);
  assert.deepEqual(await unprintableCharacters("田中"), ["田", "中"]);
  const bytes = await certificatePdf({
    learnerName: "Ada Lovelace",
    moduleTitle: "Foundations of Artificial Intelligence",
    completedOn: new Date("2026-11-12"),
    code: "BL-M1-ABCD-2345",
  });
  assert.equal(Buffer.from(bytes).subarray(0, 5).toString(), "%PDF-");
  assert.ok(bytes.length > 5000);
});
