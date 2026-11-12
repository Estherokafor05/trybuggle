export type Question = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
};
export function scoreAssessment(questions: Question[], answers: unknown) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers))
    throw new Error("Answer every question.");
  const input = answers as Record<string, unknown>;
  if (
    questions.length !== 10 ||
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
  return { correct, score: correct * 10, passed: correct >= 7, feedback };
}
