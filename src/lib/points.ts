// How many points each thing earns. Shared by the server and the browser.
// Points are just for fun: they never change scores or certificates.
export const POINTS = {
  question: 5,
  answer: 3,
  comment: 3,
  helpful: 2,
  accepted: 10,
  check: 10,
  checkFirstTry: 15,
  module: 25,
  lessonDone: 3,
} as const;
