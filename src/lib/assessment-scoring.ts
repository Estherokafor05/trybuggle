export type Question = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
};
/** Right answers needed to pass. The default 70% means 7 of 10, 6 of 8, 4 of 5. */
export const passMark = (questionCount: number, passPercent = 70) =>
  Math.ceil((questionCount * passPercent) / 100);
export function scoreAssessment(
  questions: Question[],
  answers: unknown,
  expectedCount = 10,
  passPercent = 70,
) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers))
    throw new Error("Answer every question.");
  const input = answers as Record<string, unknown>;
  if (
    questions.length !== expectedCount ||
    Object.keys(input).length !== questions.length ||
    Object.keys(input).some((id) => !questions.some((q) => q.id === id))
  )
    throw new Error("Answer every question.");
  const feedback = questions.map((q) => {
    const answer = input[q.id];
    if (typeof answer !== "string" || !q.options.some((o) => o.id === answer))
      throw new Error("Choose one available answer for every question.");
    return {
      id: q.id,
      prompt: q.prompt,
      correct: answer === q.correct,
      answer: q.options.find((o) => o.id === answer)!.text,
      expected: q.options.find((o) => o.id === q.correct)!.text,
      explanation: q.explanation,
    };
  });
  const correct = feedback.filter((f) => f.correct).length;
  return {
    correct,
    score: Math.round((correct / questions.length) * 100),
    passed: correct >= passMark(questions.length, passPercent),
    feedback,
  };
}
