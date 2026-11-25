import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { assessmentBank, moduleAssessmentBank } from "../../courses/ai-literacy/assessments";
import { modules } from "../../courses/ai-literacy/content/modules";

process.loadEnvFile(".env.local");
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Integration fixtures must run against a local application.");
const lesson = (slug = "what-counts-as-ai") =>
  `/modules/ai-foundations/lessons/${slug}`;
const users: string[] = [];
const emails = new Map<string, string>();
const PASSWORD = "a-long-test-password";
/**
 * Signs a browser context in through the real sign-in. A new learner is created
 * unless an existing learner's ID is given (to sign the same learner in elsewhere).
 * Their email is confirmed directly in the test database: these tests cover
 * learning, and tests/db/auth.test.ts covers the confirmation email.
 * Run the app with AUTH_RATE_LIMIT=off so the many quick sign-ins are allowed.
 */
async function signIn(context: import("@playwright/test").BrowserContext, id?: string) {
  let email = id ? emails.get(id) : undefined;
  if (!id || !email) {
    email = `qa-learning-${randomUUID()}@example.com`;
    const signUp = await context.request.post(base + "/api/auth/sign-up/email", {
      headers: { Origin: base },
      data: { name: "Test learner", email, password: PASSWORD },
    });
    expect(signUp.status()).toBe(200);
    id = (await signUp.json()).user.id as string;
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    try {
      await sql`UPDATE auth_user SET "emailVerified" = true WHERE id = ${id}`;
    } finally {
      await sql.end();
    }
    emails.set(id, email);
    users.push(id);
  }
  const signInResponse = await context.request.post(base + "/api/auth/sign-in/email", {
    headers: { Origin: base },
    data: { email, password: PASSWORD },
  });
  expect(signInResponse.status()).toBe(200);
  return id;
}
/**
 * Lessons open in order. Passes every check before the given step through the
 * real API, so a test can start at a later lesson.
 */
async function passUpTo(context: import("@playwright/test").BrowserContext, moduleSlug: string, stepId: string) {
  const submit = async (url: string, questions: { id: string; correct: string }[]) => {
    const answers = Object.fromEntries(questions.map((q) => [q.id, q.correct]));
    const response = await context.request.post(base + url, {
      headers: { Origin: base },
      data: { version: 1, submissionKey: randomUUID(), answers },
    });
    expect(response.status(), url).toBe(200);
  };
  for (const mod of [...modules].sort((a, b) => a.order - b.order)) {
    for (const item of mod.lessons) {
      if (!assessmentBank[item.slug]) continue;
      if (mod.slug === moduleSlug && item.slug === stepId) return;
      await submit(`/api/assessments/${item.slug}/submissions`, assessmentBank[item.slug]);
    }
    if (moduleAssessmentBank[mod.slug]) {
      if (mod.slug === moduleSlug && stepId === "final-assessment") return;
      await submit(`/api/modules/${mod.slug}/final-assessment/submissions`, moduleAssessmentBank[mod.slug]);
    }
  }
}
/** Submits Lesson 1's knowledge check with every answer wrong (a first check, as the forum needs). */
async function submitWrongCheck(context: import("@playwright/test").BrowserContext) {
  const answers = Object.fromEntries(
    assessmentBank["what-counts-as-ai"].map((q) => [q.id, q.options.find((o) => o.id !== q.correct)!.id]),
  );
  const response = await context.request.post(`${base}/api/assessments/what-counts-as-ai/submissions`, {
    headers: { Origin: base },
    data: { version: 1, submissionKey: randomUUID(), answers },
  });
  expect(response.status()).toBe(200);
}
/** Remember a context's anonymous guest ID so its test results are cleaned up. */
async function trackGuest(context: import("@playwright/test").BrowserContext) {
  const guest = (await context.cookies(base)).find((c) => c.name === "buggle_guest");
  if (guest && !users.includes(`guest:${guest.value}`)) users.push(`guest:${guest.value}`);
}
test.afterAll(async () => {
  if (!users.length) return;
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM forum_reports WHERE reporter_id IN ${tx(users)}`;
      await tx`DELETE FROM forum_votes WHERE user_id IN ${tx(users)}`;
      await tx`DELETE FROM forum_threads WHERE author_id IN ${tx(users)}`;
      await tx`DELETE FROM forum_posts WHERE author_id IN ${tx(users)}`;
      await tx`DELETE FROM certificates WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM module_assessment_attempts WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM learning_checkpoints WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM assessment_attempts WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM learners WHERE id IN ${tx(users)}`;
      await tx`DELETE FROM auth_user WHERE id IN ${tx(users)}`;
    });
  } finally {
    await sql.end();
  }
});
test("Lesson 1 supports both routes, all activities and local resume", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto(lesson());
  await expect(
    page.getByRole("heading", { name: "What is AI?", exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Read & Explore/ }),
  ).toBeEnabled();
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState))
    .toBeGreaterThan(0);
  await video.evaluate((v: HTMLVideoElement) => {
    v.currentTime = 48;
  });
  await video.evaluate((v: HTMLVideoElement) => v.play());
  await page
    .getByRole("button", { name: /^Read & Explore/ })
    .click();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  // Step 1: try the three tools, then answer
  for (const tool of ["Speech to text", "Photo search", "Writing helper"])
    await page.getByRole("button", { name: new RegExp(`^${tool}`) }).click();
  await expect(
    page.getByText("A short request: “Invite the team to a meeting”"),
  ).toBeVisible();
  await page.getByLabel(/^Computer systems that can recognise/).check();
  await expect(page.getByText("You got it!")).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  // Step 2: timer, then speech
  await page.getByRole("button", { name: /Start the timer/ }).click();
  await expect(page.getByText(/Time's up/)).toBeVisible();
  await page.getByLabel(/^Yes, because it works automatically/).check();
  await expect(page.getByText(/Not quite/)).toBeVisible();
  await page.getByLabel(/^No, working automatically/).check();
  await page.getByRole("button", { name: /Play Maya's voice note/ }).click();
  await expect(page.getByText("What's the difference?")).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  // Step 3: train and test
  await page
    .getByRole("button", { name: "Train the computer with these examples" })
    .click();
  await expect(page.getByText("✓ Trained on 4 examples")).toBeVisible();
  await page.locator("input[name=test1]").first().check();
  await page.locator("input[name=test2]").first().check();
  await expect(page.getByText(/It's actually a cat hiding/)).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  // Step 4: build a safe request
  await page.getByLabel(/^Volunteers' private phone numbers/).check();
  await page.getByRole("button", { name: /Send the request/ }).click();
  await expect(page.getByText(/Keep private information out/)).toBeVisible();
  await page.getByLabel(/^Volunteers' private phone numbers/).uncheck();
  await page.getByLabel(/^What it's for/).check();
  await page.getByLabel(/^The details/).check();
  await page.getByRole("button", { name: /Send the request/ }).click();
  await expect(page.getByText("It sounds great. But is it right?")).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  // Step 5: check and fix the draft
  for (const part of ["Friday", "6 pm", "Room Three", "Parking is free."])
    await page.getByRole("button", { name: `Check “${part}”` }).click();
  await expect(page.getByText(/The tool made this up/)).toBeVisible();
  await page.getByRole("button", { name: /Fix the draft/ }).click();
  await expect(page.getByText("✅ Checked invitation")).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  // Step 6: final question and private notes
  await page.getByLabel(/^Check with a pharmacist or doctor/).check();
  await page
    .getByRole("textbox", { name: "In my own words, AI is…", exact: true })
    .fill("Find patterns, but check important details.");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Put it in your own words", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "In my own words, AI is…", exact: true }),
  ).toHaveValue("Find patterns, but check important details.");
  await page
    .getByRole("button", { name: /^Watch & Listen/ })
    .click();
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(45);
  await expect(page.locator("video")).toHaveAttribute("src", /what-is-ai/);
  await page.screenshot({
    path: "/private/tmp/buggle-lesson-one-desktop.png",
    fullPage: true,
  });
});
test("Maya guide explores photos, changing predictions, fit and message verification", async ({
  page,
  context,
}) => {
  await signIn(context);
  await passUpTo(context, "ai-foundations", "ai-in-your-day");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(lesson("ai-in-your-day"));
  await page
    .getByRole("button", { name: /^Read & Explore/ })
    .click();
  const places = [
    ["1. Home", "Alarm clock", "Photo app", /^That it's the right dog/],
    ["2. The journey", "Traffic lights", "Map app", /^Treat the time as a guess/],
    ["3. Community centre", "Printer", "Email app", /^Compare it with her booking/],
    ["4. Online shop", "Basket total", "“You might like”", /^No\. It only fits/],
  ] as const;
  for (const [stop, ordinary, tool, check] of places) {
    await page.getByRole("button", { name: new RegExp(`^${stop}`) }).click();
    await page.getByRole("button", { name: ordinary, exact: true }).click();
    await expect(page.getByText(/probably not AI/)).toBeVisible();
    await page.getByRole("button", { name: tool, exact: true }).click();
    await page.getByRole("button", { name: /Watch it work/ }).click();
    await page.getByLabel(check).check();
    await expect(page.getByText(/^This is called/)).toBeVisible();
    await page.getByRole("button", { name: "← Back to the map" }).click();
  }
  await expect(page.getByText("4 of 4 places explored")).toBeVisible();
  await page.getByRole("button", { name: /^Step 6/ }).click();
  await expect(
    page.getByRole("heading", { name: "What did you notice?" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const access = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(access.violations).toEqual([]);
  await page.screenshot({
    path: "/private/tmp/buggle-maya-guide-phone.png",
    fullPage: true,
  });
});
test("reading alternative is complete with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 780 },
  });
  await signIn(context);
  await passUpTo(context, "ai-foundations", "ai-in-your-day");
  const page = await context.newPage();
  for (const slug of ["what-counts-as-ai", "ai-in-your-day"]) {
    await page.goto(base + lesson(slug) + "/reading");
    await expect(
      page.getByRole("heading", { name: "Try it in your own words" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Take the knowledge check" }),
    ).toBeVisible();
    expect(await page.locator("section").count()).toBeGreaterThan(6);
  }
  await context.close();
});
test("authenticated API enforces account isolation, optimistic saves and official scores", async ({
  browser,
}) => {
  const first = await browser.newContext(),
    second = await browser.newContext(),
    guest = await browser.newContext();
  const id = await signIn(first);
  await signIn(second);
  const path = "/api/me/learning/what-counts-as-ai",
    checkpoint = {
      version: 1,
      route: "explore",
      step: 2,
      visited: ["meet", "automatic"],
      activities: {},
      videoTime: 31,
    };
  expect((await guest.request.get(base + path)).status()).toBe(401);
  const saved = await first.request.post(base + path, {
    headers: { Origin: base },
    data: { revision: 0, checkpoint },
  });
  expect(saved.status()).toBe(200);
  expect(
    (
      await first.request.post(base + path, {
        headers: { Origin: base },
        data: { revision: 0, checkpoint },
      })
    ).status(),
  ).toBe(409);
  expect((await second.request.get(base + path)).status()).toBe(200);
  expect(
    (await (await second.request.get(base + path)).json()).checkpoint,
  ).toBeNull();
  expect(
    (
      await first.request.post(base + path, {
        headers: { Origin: base },
        data: { revision: 1, checkpoint: { ...checkpoint, passed: true } },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await first.request.post(base + path, {
        headers: { Origin: "https://example.invalid" },
        data: { revision: 1, checkpoint },
      })
    ).status(),
  ).toBe(403);
  const sameUser = await browser.newContext();
  await signIn(sameUser, id);
  const restored = await (await sameUser.request.get(base + path)).json();
  expect(restored.checkpoint.step).toBe(2);
  await sameUser.close();
  const before = await (
    await first.request.get(base + "/api/me/progress")
  ).json();
  expect(
    before.lessons.every(
      (l: { passed: boolean; attempts: number }) =>
        !l.passed && l.attempts === 0,
    ),
  ).toBe(true);
  const publicQuestions = await (
    await first.request.get(base + "/api/assessments/what-counts-as-ai")
  ).json();
  expect(publicQuestions.questions).toHaveLength(5);
  expect(
    publicQuestions.questions.every(
      (q: object) => !("correct" in q) && !("explanation" in q),
    ),
  ).toBe(true);
  const questions = assessmentBank["what-counts-as-ai"];
  for (const numberCorrect of [3, 4]) {
    const answers = Object.fromEntries(
      questions.map((q, i) => [
        q.id,
        i < numberCorrect
          ? q.correct
          : q.options.find((o) => o.id !== q.correct)!.id,
      ]),
    );
    const data = { submissionKey: randomUUID(), version: 1, answers };
    const response = await first.request.post(
      base + "/api/assessments/what-counts-as-ai/submissions",
      { headers: { Origin: base }, data },
    );
    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.correct_count).toBe(numberCorrect);
    expect(result.passed).toBe(numberCorrect === 4);
    const duplicate = await first.request.post(
      base + "/api/assessments/what-counts-as-ai/submissions",
      { headers: { Origin: base }, data },
    );
    expect((await duplicate.json()).id).toBe(result.id);
  }
  const after = await (
    await first.request.get(base + "/api/me/progress")
  ).json();
  const progress = after.lessons.find(
    (l: { slug: string }) => l.slug === "what-counts-as-ai",
  );
  expect(progress.attempts).toBe(2);
  expect(progress.passed).toBe(true);
  expect(
    (await (await first.request.get(base + path)).json()).checkpoint,
  ).toEqual(checkpoint);
  await first.close();
  await second.close();
  await guest.close();
});
test("signed-in learner can submit, review feedback and retry without restarting the guide", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto(lesson());
  await page
    .getByRole("button", { name: /^Read & Explore/ })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Automatic or AI?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open the knowledge check" }).click();
  const questions = assessmentBank["what-counts-as-ai"];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await page
      .locator(
        `input[name="${q.id}"][value="${i < 3 ? q.correct : q.options.find((o) => o.id !== q.correct)!.id}"]`,
      )
      .check();
  }
  await page.getByRole("button", { name: "Submit knowledge check" }).click();
  await expect(
    page.getByText("Review the feedback and try again", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Retry this assessment", exact: true })
    .click();
  for (const q of questions)
    await page.locator(`input[name="${q.id}"][value="${q.correct}"]`).check();
  await page.getByRole("button", { name: "Submit knowledge check" }).click();
  await expect(
    page.getByText("Knowledge check passed", { exact: true }),
  ).toBeVisible();
  // Passing on the second try earns the usual points, shown straight away.
  await expect(page.getByText(/\+10 points/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Automatic or AI?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open the knowledge check" }).click();
  await expect(
    page.getByText(/You have passed this lesson’s knowledge check/),
  ).toBeVisible();
  const access = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(access.violations).toEqual([]);
});

test("a saved place follows the learner and a newer-device save can be restored", async ({
  page,
  context,
  browser,
}) => {
  const id = await signIn(context);
  await page.goto(lesson());
  await page
    .getByRole("button", { name: /^Read & Explore/ })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await expect(
    page.getByText("Saved to your account", { exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Automatic or AI?" }),
  ).toBeVisible();
  const path = base + "/api/me/learning/what-counts-as-ai";
  const other = await browser.newContext();
  await signIn(other, id);
  const old = await (await other.request.get(path)).json();
  expect(old.checkpoint.step).toBe(1);
  const checkpoint = {
    ...old.checkpoint,
    route: "watch",
    step: 3,
    videoTime: 80,
  };
  expect(
    (
      await other.request.post(path, {
        headers: { Origin: base },
        data: { revision: old.revision, checkpoint },
      })
    ).status(),
  ).toBe(200);
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await expect(
    page.getByText(/A newer place was saved in another tab or device/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Load the newer place" }).click();
  await expect(
    page.getByRole("button", { name: /^Watch & Listen/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(79);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(79);
  const progress = await (
    await context.request.get(base + "/api/me/progress")
  ).json();
  expect(
    progress.lessons.every((l: { attempts: number }) => l.attempts === 0),
  ).toBe(true);
  await other.close();
});

test("an interrupted account save resumes from the device and retries safely", async ({
  page,
  context,
}) => {
  await signIn(context);
  await page.goto(lesson());
  await page
    .getByRole("button", { name: /^Read & Explore/ })
    .click();
  await expect(
    page.getByText("Saved to your account", { exact: true }),
  ).toBeVisible();
  await page.route("**/api/me/learning/what-counts-as-ai", async (route) => {
    if (route.request().method() === "POST")
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"error":"Test connection interruption"}',
      });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await expect(page.getByText(/Could not save to your account/)).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Automatic or AI?" }),
  ).toBeVisible();
  await page.unroute("**/api/me/learning/what-counts-as-ai");
  await expect(
    page.getByText(
      /^(Saved to your account|Your account’s learning place is ready\.)$/,
    ),
  ).toBeVisible({ timeout: 10000 });
  const saved = await (
    await context.request.get(base + "/api/me/learning/what-counts-as-ai")
  ).json();
  expect(saved.checkpoint.step).toBe(1);
});

test("Lesson 3 needs an account, then both routes, every activity and the check work", async ({
  browser,
}) => {
  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  for (const path of [lesson("before-chatgpt"), lesson("before-chatgpt") + "/reading"]) {
    await guestPage.goto(path);
    await expect(guestPage).toHaveURL(`${base}/sign-in?callbackUrl=${encodeURIComponent(path)}`);
    await expect(guestPage.getByRole("heading", { name: "Log in", level: 1 })).toBeVisible();
  }
  await signIn(guest);
  await passUpTo(guest, "ai-foundations", "ai-in-your-day");
  await guestPage.goto(lesson("ai-in-your-day"));
  await expect(guestPage.getByRole("link", { name: /Start Lesson 3/ })).toHaveAttribute("href", lesson("before-chatgpt"));
  await guest.close();

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "ai-foundations", "before-chatgpt");
    const page = await context.newPage();
    await page.goto(lesson("before-chatgpt"));
    await expect(
      page.getByRole("heading", { name: "AI Did Not Start with ChatGPT", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Free preview")).toHaveCount(0);
    const video = page.locator("video");
    await expect(video).toHaveAttribute("src", /before-chatgpt\/story/);
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.duration), { timeout: 15000 })
      .toBeGreaterThan(250);

    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    // 1950: Turing's game
    await page.getByRole("button", { name: /Partner A/ }).click();
    await expect(page.getByText("You can't be sure, and that's the point")).toBeVisible();
    await page.getByLabel(/Whether machines could show intelligent behaviour/).check();
    await expect(page.getByText("You got it!")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    // 1956: the name
    await page.getByLabel("Artificial intelligence").check();
    await expect(page.getByText("Older than you might think")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    // Rules: a wrong path offers a restart, the right one gets stuck
    await page.getByRole("button", { name: "No", exact: true }).click();
    await expect(page.getByText("Good advice, wrong printer")).toBeVisible();
    await page.getByRole("button", { name: "Start again" }).click();
    for (const reply of ["Yes", "Yes", "No"])
      await page.getByRole("button", { name: reply, exact: true }).click();
    await expect(page.getByText("Sorry, I don't have a rule for this problem.")).toBeVisible();
    await page.getByLabel("Nobody had written a rule for this problem").check();
    await expect(page.getByText("AI winters", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    // Sorting
    const kinds = ["Rules and searching", "Learning from examples", "Rules and searching", "Learning from examples"];
    const groups = page.locator("fieldset");
    for (const [i, kind] of kinds.entries())
      await groups.nth(i).getByLabel(kind).check();
    await expect(page.getByText("All four sorted!")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    // Ordering, with one early mistake
    await page.getByRole("button", { name: "ChatGPT lets almost anyone chat with AI" }).click();
    await expect(page.getByText("↺ Not yet")).toBeVisible();
    for (const text of [
      "Turing asks whether machines can think",
      "A Dartmouth workshop names the field",
      "Rule-based expert systems spread",
      "Deep Blue beats Kasparov at chess",
      "Machine learning powers everyday tools",
      "ChatGPT lets almost anyone chat with AI",
    ])
      await page.getByRole("button", { name: text }).click();
    await expect(page.getByText("The story is in order")).toBeVisible();
    await page.getByLabel(/Almost anyone could type a question/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    // Back to today
    await page.getByLabel(/People have worked on AI since the 1950s/).check();
    await expect(page.getByText("You got it!")).toBeVisible();

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.waitForTimeout(900);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    await page.getByRole("link", { name: "Take the knowledge check →" }).click();
    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    const questions = assessmentBank["before-chatgpt"];
    expect(questions).toHaveLength(5);
    for (const q of questions)
      await expect(page.locator(`input[name="${q.id}"]`)).toHaveCount(q.options.length);
    await context.close();
  }

  const reader = await browser.newContext();
  await signIn(reader);
  await passUpTo(reader, "ai-foundations", "before-chatgpt");
  const readingPage = await reader.newPage();
  await readingPage.goto(lesson("before-chatgpt") + "/reading");
  await expect(readingPage.getByRole("heading", { name: "The AI Time Machine" })).toBeVisible();
  await expect(readingPage.getByRole("heading", { level: 2 })).toHaveCount(7);
  await reader.close();
});

test("Lessons 4 and 5: locked until earlier checks pass, every activity and accessibility", async ({
  browser,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    const page = await context.newPage();

    // Lessons open in order: Lesson 4 is locked until Lessons 1 to 3 are passed.
    await page.goto(lesson("ai-or-software"));
    await expect(page.getByRole("heading", { name: "Lesson 4: AI or Ordinary Software?", level: 1 })).toBeVisible();
    await expect(page.getByText("Not open yet")).toBeVisible();
    await expect(page.getByRole("link", { name: /Go to Lesson 1/ })).toHaveAttribute("href", `${lesson()}#knowledge-check`);
    await expect(page.locator("video")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const early = await context.request.get(`${base}/api/assessments/ai-or-software`);
    expect(early.status()).toBe(403);
    await passUpTo(context, "ai-foundations", "ai-or-software");

    // Lesson 4: Step into Daniel's reception
    await page.goto(lesson("ai-or-software"));
    await expect(page.getByRole("heading", { name: "AI or Ordinary Software?", level: 1 })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /ai-or-software\/story/);
    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    for (const tool of ["Calendar", "Check-in tablet", "Shared inbox", "Badge printer"])
      await page.getByRole("button", { name: new RegExp(tool) }).click();
    for (const tool of ["calendar", "tablet", "inbox", "badge"])
      await page.locator(`input[name="guess-${tool}"]`).first().check();
    await expect(page.getByText("Guesses saved")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel("2:00 pm").check();
    await page.getByLabel("15 min before").check();
    await page.getByRole("button", { name: /Fast-forward/ }).click();
    await page.getByLabel("4:30 pm").check();
    await page.getByRole("button", { name: /Fast-forward/ }).click();
    await expect(page.getByText("Under the hood")).toBeVisible();
    await page.getByLabel(/It followed an instruction/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel("Who are you meeting?").fill("Tom Reed");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.getByLabel("Who are you meeting?").fill("Tom Red");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/Host not found/)).toBeVisible();
    await page.getByLabel(/It follows set steps/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    const sortTo = ["Parking", "Deliveries", "IT Support", "Parking", "Deliveries", "IT Support"];
    for (const [i, folder] of sortTo.entries())
      await page.locator(`input[name="train-m${i + 1}"]`).nth(["Parking", "Deliveries", "IT Support"].indexOf(folder)).check();
    await page.getByRole("button", { name: /Send a new message/ }).click();
    await page.getByRole("button", { name: /Send a new message/ }).click();
    await expect(page.getByText("That's machine learning")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    const fix = { q1: 1, q2: 2, q3: 3, q4: 0 };
    for (const [id, index] of Object.entries(fix))
      await page.locator(`input[name="queue-${id}"]`).nth(index).check();
    await expect(page.getByText("You caught it!")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    const kinds = { calendar: 0, tablet: 0, inbox: 1, sheet: 0, chatbot: 2 };
    for (const [id, index] of Object.entries(kinds))
      await page.locator(`input[name="sort-${id}"]`).nth(index).check();
    await expect(page.getByText("Your first guesses", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Lesson 5: Help Amina hire fairly (opens once Lesson 4's check is passed)
    await passUpTo(context, "ai-foundations", "what-ai-can-do");
    await page.goto(lesson("what-ai-can-do"));
    await expect(page.getByRole("heading", { name: "What AI Can Do, and Where You Stay in Charge", level: 1 })).toBeVisible();
    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    await page.getByRole("button", { name: /list of applicants' names/ }).click();
    await page.getByRole("button", { name: "Send to the assistant" }).click();
    await expect(page.getByText("Take something out first")).toBeVisible();
    await page.getByRole("button", { name: /list of applicants' names/ }).click();
    for (const item of [/public job description/, /The role title/, /The tone/])
      await page.getByRole("button", { name: item }).click();
    await page.getByRole("button", { name: "Send to the assistant" }).click();
    await expect(page.getByText("AI draft")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    for (const [id, index] of Object.entries({ c1: 0, c2: 0, c3: 1, c4: 0 }))
      await page.locator(`input[name="claim-${id}"]`).nth(index).check();
    await page.getByRole("button", { name: "Fix the summary" }).click();
    await expect(page.getByText("Summary corrected")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    for (const [id, index] of Object.entries({ q1: 0, q2: 0, q3: 1, q4: 0, q5: 1, q6: 0 }))
      await page.locator(`input[name="question-${id}"]`).nth(index).check();
    await expect(page.getByText("A fairer list")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/approved HR system/).check();
    await expect(page.getByText("Before sharing personal information")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Have the panel assess/).check();
    await page.getByRole("button", { name: "See how the ranking was made" }).click();
    await expect(page.getByText("Behind the ranking")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    for (const [id, index] of Object.entries({ s1: 0, s2: 1, s3: 1, s4: 2, s5: 2 }))
      await page.locator(`input[name="level-${id}"]`).nth(index).check();
    await expect(page.getByText("What you've learned")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("link", { name: "Take the knowledge check →" }).click();
    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    for (const q of assessmentBank["what-ai-can-do"])
      await expect(page.locator(`input[name="${q.id}"]`)).toHaveCount(q.options.length);
    await trackGuest(context);
    await context.close();
  }
});

test("Module 1 final assessment: locked until the lessons, then the module is complete", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const id = await signIn(context);
  const page = await context.newPage();
  const final = moduleAssessmentBank["ai-foundations"];
  expect(final).toHaveLength(8);

  // Locked until every lesson check is passed.
  await page.goto("/modules/ai-foundations/final-assessment");
  await expect(page.getByRole("heading", { name: "Module 1 final assessment", level: 1 })).toBeVisible();
  await expect(page.getByText("Not open yet")).toBeVisible();
  expect((await context.request.get(`${base}/api/modules/ai-foundations/final-assessment`)).status()).toBe(403);
  await passUpTo(context, "ai-foundations", "what-ai-can-do");

  // Not complete yet: the last lesson check isn't passed.
  await page.goto("/modules/ai-foundations/certificate");
  await expect(page.getByRole("heading", { name: "Finish Module 1", level: 1 })).toBeVisible();
  await expect(page.getByText("You're nearly there.")).toBeVisible();
  await expect(page.getByText("4 of 6 done")).toBeVisible();
  // Modules no longer have their own certificate.
  const refused = await context.request.post(base + "/api/me/certificates/ai-foundations", {
    headers: { Origin: base },
    data: { name: "Test learner" },
  });
  expect(refused.status()).toBe(410);
  await passUpTo(context, "ai-foundations", "final-assessment");

  // Fail with 5 of 8, then pass with 6 of 8.
  await page.goto("/modules/ai-foundations/final-assessment");
  await expect(page.getByRole("heading", { name: "Final assessment", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Open the final assessment" }).click();
  const answer = async (correct: number) => {
    for (const [i, q] of final.entries())
      await page.locator(`input[name="${q.id}"][value="${i < correct ? q.correct : q.options.find((o) => o.id !== q.correct)!.id}"]`).check();
    await page.getByRole("button", { name: "Submit final assessment" }).click();
  };
  await answer(5);
  await expect(page.getByText("5 of 8 correct")).toBeVisible();
  await expect(page.getByText("Review the feedback and try again")).toBeVisible();
  // Wrong answers offer "Ask Buggle": the helper thinks, then explains, and says who wrote it.
  await expect(page.getByText("✗ Wrong")).toHaveCount(3);
  const ask = page.getByRole("button", { name: "Wrong. Want to know why? Ask Buggle" }).first();
  await expect(ask).toHaveAttribute("aria-expanded", "false");
  await ask.click();
  await expect(page.getByText("Here's why that's not quite right")).toBeVisible();
  await expect(page.getByText("Written by the Buggle Learn course team, not by AI.")).toBeVisible();
  await expect(page.getByText(/Ask AI for more: coming soon for premium learners/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Right! Want to know why? Ask Buggle" }).first()).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Close Buggle's explanation" }).click();
  await expect(page.getByText("Here's why that's not quite right")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry this assessment" }).click();
  await answer(6);
  await expect(page.getByText("Final assessment passed")).toBeVisible();
  await expect(page.getByText("6 of 8 correct")).toBeVisible();
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // The module is complete and counts towards the Essentials certificate.
  await page.goto("/modules/ai-foundations/certificate");
  await expect(page.getByRole("heading", { name: "Module 1 complete", level: 1 })).toBeVisible();
  await expect(page.getByText("6 of 6 done")).toBeVisible();
  await expect(page.getByRole("link", { name: /See your Essentials certificate/ })).toHaveAttribute("href", "/certificate");
  await expect(page.getByRole("link", { name: "Start Module 2" })).toHaveAttribute("href", "/modules/talking-to-ai/lessons/a-new-helper");
  await expect(page.getByLabel("Name on your certificate")).toHaveCount(0);

  // One module is not the whole Essentials.
  await page.goto("/certificate");
  await expect(page.getByRole("heading", { name: "AI Literacy Essentials", level: 1 })).toBeVisible();
  await expect(page.getByText("You're on your way.")).toBeVisible();
  await expect(page.getByText("1 of 2 modules complete")).toBeVisible();
  const early = await context.request.post(base + "/api/me/certificates/essentials", {
    headers: { Origin: base },
    data: { name: "Test learner" },
  });
  expect(early.status()).toBe(403);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  void id;
  await context.close();
});

test("signing out from the bottom of account settings ends the session on phone and desktop", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    const page = await context.newPage();
    await page.goto(lesson("before-chatgpt"));
    const phone = viewport.width < 1024;
    // The header no longer has a sign-out button, on any screen size.
    if (phone) {
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(page.getByText("Signed in as Test L.")).toBeVisible();
    }
    await expect(page.getByRole("banner").getByRole("button", { name: "Sign out" })).toHaveCount(0);
    await page.getByRole("banner").getByRole("link", { name: "Your account" }).first().click();
    await expect(page.getByRole("heading", { name: "Your account", level: 1 })).toBeVisible();
    // It is the last section of the page.
    const lastHeading = await page.locator("main h2").last().textContent();
    expect(lastHeading).toBe("Sign out or delete");
    await page.getByRole("main").getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(base + "/");
    await page.goto("/modules/ai-foundations/certificate");
    await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Fmodules%2Fai-foundations%2Fcertificate/);
    expect((await context.request.get(base + "/api/me/certificates/ai-foundations")).status()).toBe(401);
    await context.close();
  }
  const guest = await browser.newPage();
  await guest.goto("/");
  await expect(guest.getByRole("button", { name: "Sign out" })).toHaveCount(0);
  await expect(guest.getByRole("link", { name: "Log in" }).first()).toBeVisible();
  await guest.close();
});

test("learning needs an account; results earned as a guest earlier move in at sign-in", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // Without an account, lessons send the learner to log in and the APIs refuse.
  await page.goto(lesson("ai-or-software"));
  await expect(page).toHaveURL(`${base}/sign-in?callbackUrl=${encodeURIComponent(lesson("ai-or-software"))}`);
  const answers = Object.fromEntries(assessmentBank["what-counts-as-ai"].map((q) => [q.id, q.correct]));
  expect(
    (await context.request.post(`${base}/api/assessments/what-counts-as-ai/submissions`, {
      headers: { Origin: base },
      data: { version: 1, submissionKey: randomUUID(), answers },
    })).status(),
  ).toBe(401);

  // Someone who passed everything as a guest, before accounts were required.
  const guestUuid = randomUUID();
  const guest = `guest:${guestUuid}`;
  users.push(guest);
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await sql`INSERT INTO learners(id) VALUES(${guest})`;
    for (const slug of ["what-counts-as-ai", "ai-in-your-day", "before-chatgpt", "ai-or-software", "what-ai-can-do"]) {
      const n = assessmentBank[slug].length;
      await sql`INSERT INTO assessment_attempts(id, learner_id, lesson_slug, assessment_version, submission_key, answers, correct_count, question_count, feedback)
        VALUES(${randomUUID()}, ${guest}, ${slug}, 1, ${randomUUID()}, ${sql.json({})}, ${n}, ${n}, ${sql.json([])})`;
    }
    const finalCount = moduleAssessmentBank["ai-foundations"].length;
    await sql`INSERT INTO module_assessment_attempts(id, learner_id, module_slug, assessment_version, submission_key, answers, question_count, correct_count, feedback)
      VALUES(${randomUUID()}, ${guest}, 'ai-foundations', 1, ${randomUUID()}, ${sql.json({})}, ${finalCount}, ${finalCount}, ${sql.json([])})`;
  } finally {
    await sql.end();
  }
  await context.addCookies([{ name: "buggle_guest", value: guestUuid, url: base, httpOnly: true, sameSite: "Lax" }]);

  // Guide steps show done, visited-but-not-finished and not-started distinctly.
  await signIn(context);
  await page.goto(lesson("ai-or-software"));
  await page.getByRole("button", { name: /^Read & Explore/ }).click();
  await page.getByRole("button", { name: "Continue →" }).click();
  await expect(page.getByRole("button", { name: /Step 1: Daniel's desk \(visited, not finished\)/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Step 3: .*\(not started\)/ })).toBeVisible();
  await page.getByRole("button", { name: /Step 1:/ }).click();
  for (const tool of ["Calendar", "Check-in tablet", "Shared inbox", "Badge printer"])
    await page.getByRole("button", { name: new RegExp(tool) }).click();
  for (const tool of ["calendar", "tablet", "inbox", "badge"])
    await page.locator(`input[name="guess-${tool}"]`).first().check();
  await expect(page.getByRole("button", { name: /Step 1: Daniel's desk \(done\)/ })).toBeVisible();

  // The guest's passes now belong to the account, and Module 1 is complete.
  await page.goto("/modules/ai-foundations/certificate");
  await expect(page.getByText("6 of 6 done")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Module 1 complete", level: 1 })).toBeVisible();
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect((await context.cookies(base)).some((c) => c.name === "buggle_guest")).toBe(false);
  await context.close();
});

test("Episode 2.1: Module 2 page, every guide step, a 5-question check and accessibility", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "talking-to-ai", "a-new-helper");
    const page = await context.newPage();
    await page.goto("/modules/talking-to-ai");
    await expect(page.getByRole("heading", { name: "Talking to AI", level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /Start Episode 2\.1/ }).click();
    await expect(page.getByRole("heading", { name: "A New Helper", level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Your path through Module 2" })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /a-new-helper\/story/);

    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    const fit = { newsletter: 0, rooms: 1, emails: 0, volunteers: 1, ideas: 0 };
    for (const [id, i] of Object.entries(fit)) await page.locator(`input[name="job-${id}"]`).nth(i).check();
    await expect(page.getByText("Chat tools help with words")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByText("Warm, polished and quick")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByRole("button", { name: /Our community centre is a warm/ }).click();
    await expect(page.getByText(/Look for a line with a specific fact/)).toBeVisible();
    await page.getByRole("button", { name: /For over fifty years/ }).click();
    await page.getByRole("button", { name: /Add Maya's note/ }).click();
    await expect(page.getByText("Note added")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel("together").check();
    await page.getByLabel("fifty").check();
    await expect(page.getByText("Smooth is not the same as right")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Use it as a first draft/).check();
    await expect(page.getByText("You got it!")).toBeVisible();
    await expect(page.getByText("Step 5 of 5 · 5 done")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Five questions, four correct to pass, no account needed.
    await expect(page.getByText("5 quick questions about this episode. Get 4 or more right to pass.")).toBeVisible();
    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    const questions = assessmentBank["a-new-helper"];
    expect(questions).toHaveLength(5);
    for (const [i, q] of questions.entries())
      await page.locator(`input[name="${q.id}"][value="${i < 4 ? q.correct : q.options.find((o) => o.id !== q.correct)!.id}"]`).check();
    await page.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(page.getByText("Knowledge check passed")).toBeVisible();
    await expect(page.getByText("4 of 5 correct · 80%")).toBeVisible();
    await trackGuest(context);
    await context.close();
  }
});

test("Episode 2.2: every guide step, the request builder, a 5-question check and accessibility", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "talking-to-ai", "the-email-that-said-nothing");
    const page = await context.newPage();
    await page.goto("/modules/talking-to-ai/lessons/the-email-that-said-nothing");
    await expect(page.getByRole("heading", { name: "The Email That Said Nothing", level: 1 })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /the-email-that-said-nothing\/story/);
    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    await page.getByRole("button", { name: /We can’t wait to see you there/ }).click();
    await expect(page.getByText("↺ Not a problem.")).toBeVisible();
    for (const part of [/an exciting event/, /fun for all the family/, /on the twelfth/])
      await page.getByRole("button", { name: part }).click();
    await expect(page.getByText("All three found")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Say who the email is for/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel("Everyone").check();
    await expect(page.getByText(/Too vague/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Send the new request" })).toBeDisabled();
    for (const label of [/people who run local clubs/, /Invite them to run a stall/, /Saturday the 21st/, "Short and friendly"])
      await page.getByLabel(label).check();
    await page.getByRole("button", { name: "Send the new request" }).click();
    await expect(page.getByText("Now it actually invites them")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Just say “local club and group leaders”/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/leaking kitchen tap/).check();
    await expect(page.getByText("Step 5 of 5 · 5 done")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    const questions = assessmentBank["the-email-that-said-nothing"];
    expect(questions).toHaveLength(5);
    for (const q of questions) await page.locator(`input[name="${q.id}"][value="${q.correct}"]`).check();
    await page.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(page.getByText("5 of 5 correct · 100%")).toBeVisible();
    await trackGuest(context);
    await context.close();
  }
});

test("Episode 2.3: keep or change, follow-ups in the same chat, a 5-question check and accessibility", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "talking-to-ai", "three-tries-at-the-flyer");
    const page = await context.newPage();
    await page.goto("/modules/talking-to-ai/lessons/three-tries-at-the-flyer");
    await expect(page.getByRole("heading", { name: "Three Tries at the Flyer", level: 1 })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /three-tries-at-the-flyer\/story/);
    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    await page.getByRole("group", { name: /on Saturday the 21st/ }).getByLabel("Change").check();
    await expect(page.getByText("↺ Think again.")).toBeVisible();
    for (const [part, choice] of [[/We are delighted/, "Change"], [/on Saturday the 21st/, "Keep"], [/^“in the main hall/, "Keep"], [/presenting their activities/, "Change"]] as const)
      await page.getByRole("group", { name: part }).getByLabel(choice).check();
    await expect(page.getByText("Keep the details, change the wording")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Make it no more than fifty words/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Fix it/).check();
    await expect(page.getByText(/Try another/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Send the follow-up" })).toBeDisabled();
    await page.getByLabel(/inviting a neighbour/).check();
    await page.getByRole("button", { name: "Send the follow-up" }).click();
    await expect(page.getByText("Now it sounds like Maya")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Ask a volunteer who speaks the language/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/watering my plants/).check();
    await expect(page.getByText("Step 5 of 5 · 5 done")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    const questions = assessmentBank["three-tries-at-the-flyer"];
    expect(questions).toHaveLength(5);
    for (const q of questions) await page.locator(`input[name="${q.id}"][value="${q.correct}"]`).check();
    await page.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(page.getByText("5 of 5 correct · 100%")).toBeVisible();
    await trackGuest(context);
    await context.close();
  }
});

test("Episode 2.4: request, send or check, find what is missing, a 5-question check and accessibility", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "talking-to-ai", "thirty-pages-by-friday");
    const page = await context.newPage();
    await page.goto("/modules/talking-to-ai/lessons/thirty-pages-by-friday");
    await expect(page.getByRole("heading", { name: "Thirty Pages by Friday", level: 1 })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /thirty-pages-by-friday\/story/);
    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    await page.getByLabel(/Show me where each item comes from/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Send it to Rosa now/).check();
    await page.getByLabel(/Open the guide and check/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByRole("group", { name: /trained first-aider/ }).getByLabel("On the list").check();
    await expect(page.getByText("↺ Look again.")).toBeVisible();
    for (const [req, choice] of [[/Fire exits must be kept clear/, "On the list"], [/emergency contacts/, "On the list"], [/trained first-aider/, "Missing"]] as const)
      await page.getByRole("group", { name: req }).getByLabel(choice).check();
    await expect(page.getByText("Every line looked right")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/used AI to draft it/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/rent, deposit, notice/).check();
    await expect(page.getByText("Step 5 of 5 · 5 done")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    const questions = assessmentBank["thirty-pages-by-friday"];
    expect(questions).toHaveLength(5);
    for (const q of questions) await page.locator(`input[name="${q.id}"][value="${q.correct}"]`).check();
    await page.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(page.getByText("5 of 5 correct · 100%")).toBeVisible();
    await trackGuest(context);
    await context.close();
  }
});

test("Episode 2.5: spot what to check, ask without steering, a 5-question check and accessibility", async ({ browser }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "talking-to-ai", "the-grant-that-didnt-exist");
    const page = await context.newPage();
    await page.goto("/modules/talking-to-ai/lessons/the-grant-that-didnt-exist");
    await expect(page.getByRole("heading", { name: "The Grant That Didn't Exist", level: 1 })).toBeVisible();
    await expect(page.locator("video")).toHaveAttribute("src", /the-grant-that-didnt-exist\/story/);
    await page.getByRole("button", { name: /^Read & Explore/ }).click();
    await page.getByRole("button", { name: /^Yes!$/ }).click();
    await expect(page.getByText("↺ Nothing to check.")).toBeVisible();
    for (const part of [/The Community Open Day Fund/, /up to 1,000/, /Apply here/])
      await page.getByRole("button", { name: part }).click();
    await expect(page.getByText("Name, amount and link")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/funder’s own official page/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/We qualify for this grant/).check();
    await expect(page.getByText(/Try another/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ask the question" })).toBeDisabled();
    await page.getByLabel(/What are the eligibility rules/).check();
    await page.getByRole("button", { name: "Ask the question" }).click();
    await expect(page.getByText("✓ Something to verify")).toBeVisible();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/Who can apply and the deadline/).check();
    await page.getByRole("button", { name: "Continue →" }).click();
    await page.getByLabel(/official advice service/).check();
    await expect(page.getByText("Step 5 of 5 · 5 done")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(900);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: "Open the knowledge check" }).click();
    const questions = assessmentBank["the-grant-that-didnt-exist"];
    expect(questions).toHaveLength(5);
    for (const q of questions) await page.locator(`input[name="${q.id}"][value="${q.correct}"]`).check();
    await page.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(page.getByText("5 of 5 correct · 100%")).toBeVisible();
    await trackGuest(context);
    await context.close();
  }
});

test("Module 2 final assessment, then the Essentials certificate: naming, PDF, check page and LinkedIn", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await signIn(context);
  await passUpTo(context, "talking-to-ai", "final-assessment");
  const page = await context.newPage();
  const final = moduleAssessmentBank["talking-to-ai"];
  expect(final).toHaveLength(6);

  // The module page offers the final assessment and points to the Essentials certificate.
  await page.goto("/modules/talking-to-ai");
  await expect(page.getByText("Then · 6 questions")).toBeVisible();
  await expect(page.getByRole("link", { name: "Your Essentials certificate" })).toHaveAttribute("href", "/certificate");

  // Fail with 4 of 6, then pass with 5 of 6.
  await page.goto("/modules/talking-to-ai/final-assessment");
  await expect(page.getByRole("heading", { name: "Final assessment", level: 1 })).toBeVisible();
  await expect(page.getByText("5 to pass")).toBeVisible();
  await expect(page.getByRole("link", { name: /Previous: Episode 2.5/ })).toBeVisible();
  await page.getByRole("button", { name: "Open the final assessment" }).click();
  const answer = async (correct: number) => {
    for (const [i, q] of final.entries())
      await page.locator(`input[name="${q.id}"][value="${i < correct ? q.correct : q.options.find((o) => o.id !== q.correct)!.id}"]`).check();
    await page.getByRole("button", { name: "Submit final assessment" }).click();
  };
  await answer(4);
  await expect(page.getByText("4 of 6 correct")).toBeVisible();
  await page.getByRole("button", { name: "Retry this assessment" }).click();
  await answer(5);
  await expect(page.getByText("Final assessment passed")).toBeVisible();
  await expect(page.getByText("5 of 6 correct")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Episodes are listed by their episode numbers; the module is complete.
  await page.goto("/modules/talking-to-ai/certificate");
  await expect(page.getByText("Episode 2.3 knowledge check", { exact: true })).toBeVisible();
  await expect(page.getByText("6 of 6 done")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Module 2 complete", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Module 3: Staying Safe with AI" })).toBeVisible();
  await expect(page.getByText(/This module is being made/)).toBeVisible();

  // Every open module complete: the Essentials certificate. Modules still being
  // made are skipped on test sites only.
  await page.goto("/certificate");
  await expect(page.getByText("2 of 2 modules complete")).toBeVisible();
  await expect(page.getByText(/Test site:.*2 modules are still being made/)).toBeVisible();
  const nameField = page.getByLabel("Name on your certificate");
  await expect(nameField).toHaveValue("Test learner");
  await nameField.fill("Ada Testwoman");
  await page.getByRole("button", { name: "Create my certificate" }).click();
  await expect(page.getByText("Your certificate is ready.")).toBeVisible();
  await expect(page.getByText("Ada Testwoman")).toBeVisible();
  await expect(page.getByText("AI Literacy Essentials", { exact: true }).first()).toBeVisible();
  const code = (await page.locator("dd.font-mono").textContent())!;
  expect(code).toMatch(/^BL-E-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
  const verifyUrl = `${base}/verify/${code}`;
  await expect(page.getByLabel("Link to check your certificate")).toHaveValue(verifyUrl);
  const add = new URL((await page.getByRole("link", { name: /Add to LinkedIn profile/ }).getAttribute("href"))!);
  expect(add.origin + add.pathname).toBe("https://www.linkedin.com/profile/add");
  expect(Object.fromEntries(add.searchParams)).toMatchObject({
    startTask: "CERTIFICATION_NAME",
    name: "AI Literacy Essentials",
    organizationName: "Buggle Learn",
    certId: code,
    certUrl: verifyUrl,
  });
  await expect(page.getByRole("link", { name: /Add to LinkedIn profile/ })).toHaveAttribute("target", "_blank");
  const share = new URL((await page.getByRole("link", { name: /Share in a LinkedIn post/ }).getAttribute("href"))!);
  expect(share.searchParams.get("url")).toBe(verifyUrl);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Edit the name: the ID stays the same, and creating again never makes a second one.
  await page.getByRole("button", { name: "Edit name" }).click();
  await page.getByLabel("Name on your certificate").fill("Ada T. Learner");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByText(/Name updated/)).toBeVisible();
  await expect(page.locator("dd.font-mono")).toHaveText(code);
  expect(
    (await (await context.request.post(base + "/api/me/certificates/essentials", { headers: { Origin: base }, data: { name: "Someone Else" } })).json())
      .certificate.code,
  ).toBe(code);

  // The PDF downloads for the owner only.
  const pdf = await context.request.get(base + "/api/me/certificates/essentials/pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const other = await browser.newContext();
  await signIn(other);
  expect((await other.request.get(base + "/api/me/certificates/essentials/pdf")).status()).toBe(404);
  expect((await (await other.request.get(base + "/api/me/certificates/essentials")).json()).certificate).toBeNull();
  await other.close();

  // Anyone can check it, signed out, on a phone. Only what the certificate shows.
  const stranger = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const check = await stranger.newPage();
  await check.goto("/verify");
  await check.getByLabel("Certificate ID").fill(` ${code.toLowerCase().replaceAll("-", " ")} `);
  await check.getByRole("button", { name: "Check it" }).click();
  await expect(check).toHaveURL(verifyUrl);
  await expect(check.getByRole("heading", { name: "✓ This certificate is real", level: 1 })).toBeVisible();
  await expect(check.getByText("Ada T. Learner")).toBeVisible();
  await expect(check.getByText("AI Literacy Essentials")).toBeVisible();
  await expect(check.locator("main")).not.toContainText("@example.com");
  await expect(check.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(check.locator('meta[property="og:title"]')).toHaveAttribute("content", "Ada T. Learner completed AI Literacy Essentials");
  expect(await check.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page: check }).analyze()).violations).toEqual([]);
  await check.goto("/verify/BL-E-AAAA-AAAA");
  await expect(check.getByRole("heading", { name: "No certificate found", level: 1 })).toBeVisible();
  await check.goto("/verify?code=not-a-code");
  await expect(check.getByText("doesn't look like a Buggle Learn certificate ID")).toBeVisible();
  await stranger.close();

  // The dashboard shows it as earned.
  await page.goto("/dashboard");
  await expect(page.getByText("Time to your Essentials certificate")).toBeVisible();
  await expect(page.getByText("Earned", { exact: true })).toBeVisible();
  await context.close();
});

test("sign-up asks learners to confirm they are 15 or over", async ({ page }) => {
  await page.goto("/sign-up");
  const age = page.getByLabel("I am 15 or over");
  await expect(age).toBeVisible();
  await expect(age).toHaveAttribute("required", "");
  await expect(page.getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", "/privacy");
  await page.goto("/sign-up?error=AGE_REQUIRED");
  await expect(page.getByText(/Buggle Learn is for people aged 15 and over/)).toBeVisible();
  await page.waitForTimeout(600);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const path of ["/sign-in", "/forgot-password", "/sign-up/check-email"]) {
    await page.goto(path);
    await page.waitForTimeout(400);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});

test("a cookie from the old sign-in is ignored and reaches the log-in form instead of looping", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "authjs.session-token", value: randomUUID(), url: base, httpOnly: true, sameSite: "Lax" },
  ]);
  const page = await context.newPage();
  await page.goto("/account");
  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Faccount/);
  await expect(page.getByRole("heading", { name: "Log in", level: 1 })).toBeVisible();
  // The same from the privacy page link.
  await page.goto("/privacy");
  await page.getByRole("link", { name: "your account page" }).first().click();
  await expect(page).toHaveURL(/\/sign-in\?callbackUrl=%2Faccount/);
  await expect(page.getByRole("heading", { name: "Log in", level: 1 })).toBeVisible();
  await context.close();
});

test("a signed-in learner can delete their account and everything stored for it", async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const id = await signIn(context);
    await passUpTo(context, "talking-to-ai", "a-new-helper");
    // Store a result and a saved place for this learner.
    const answers = Object.fromEntries(assessmentBank["a-new-helper"].map((q) => [q.id, q.correct]));
    expect((await context.request.post(`${base}/api/assessments/a-new-helper/submissions`, { headers: { Origin: base }, data: { version: 1, submissionKey: randomUUID(), answers } })).status()).toBe(200);
    const page = await context.newPage();
    await page.goto("/");
    if (viewport.width < 768) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("link", { name: "Your account" }).click();
    await expect(page.getByRole("heading", { name: "Your account", level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(600);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    // Deleting is folded away until it's opened, and the confirmation box is required.
    await page.locator("summary", { hasText: "Delete your account" }).click();
    await expect(page.getByLabel(/will be deleted for good/)).toHaveAttribute("required", "");
    await page.getByLabel(/will be deleted for good/).check();
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page.getByRole("heading", { name: "Your account has been deleted" })).toBeVisible();
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    try {
      const [{ n }] = await sql`SELECT (SELECT count(*) FROM learners WHERE id=${id}) + (SELECT count(*) FROM assessment_attempts WHERE learner_id=${id}) AS n`;
      expect(Number(n)).toBe(0);
    } finally {
      await sql.end();
    }
    // Signed out: the account page now asks to sign in.
    await page.goto("/account");
    await expect(page).toHaveURL(/\/sign-in/);
    await context.close();
  }
});

test("the guest clean-up refuses requests without the secret", async ({ request }) => {
  expect((await request.get(`${base}/api/cron/guest-cleanup`)).status()).toBe(401);
  expect((await request.get(`${base}/api/cron/guest-cleanup`, { headers: { Authorization: "Bearer wrong" } })).status()).toBe(401);
});

test("first-time journey: two ways in, then a returning learner is offered to continue", async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /New to AI\?/ })).toHaveAttribute("href", "/welcome");
    await expect(page.getByRole("link", { name: /Already use AI\?/ })).toHaveAttribute("href", "/modules/talking-to-ai");
    await expect(page.getByText("Continue where you left off")).toHaveCount(0);
    // The home page explains Buggle Learn first; "Start here" is always the last section.
    expect(await page.locator("main h2").allTextContents()).toEqual([
      "We teach AI to people who don't work in tech",
      "AI for everyone, not just experts",
      "From your first lesson to your certificate",
      "How each lesson works",
      "The Essentials: 4 modules",
      "Finish the Essentials, get a certificate you can share",
      "Anyone curious about AI",
      "Good to know",
      "Start here",
    ]);
    await page.getByText("Is it free?").click();
    await expect(page.getByText(/The Essentials course and its certificate are free/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(600);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Sign up and pass Lesson 1's check: the home page now offers Lesson 2.
    await signIn(context);
    const answers = Object.fromEntries(assessmentBank["what-counts-as-ai"].map((q) => [q.id, q.correct]));
    expect((await context.request.post(`${base}/api/assessments/what-counts-as-ai/submissions`, { headers: { Origin: base }, data: { version: 1, submissionKey: randomUUID(), answers } })).status()).toBe(200);
        await page.goto("/");
    await expect(page.getByRole("heading", { name: "Continue where you left off" })).toBeVisible();
    await expect(page.getByText("Module 1 · Lesson 2: AI Is Already in Your Day")).toBeVisible();
    await expect(page.getByRole("link", { name: /^Continue/ })).toHaveAttribute("href", "/modules/ai-foundations/lessons/ai-in-your-day");
    await page.waitForTimeout(600);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await context.close();
  }
});

test("sign-in and unbuilt modules speak to where the learner is", async ({ page, context }) => {
  await page.goto("/sign-in?callbackUrl=%2Fmodules%2Ftalking-to-ai%2Fcertificate");
  await expect(page.getByRole("link", { name: /Back to Module 2/ })).toHaveAttribute("href", "/modules/talking-to-ai/certificate");
  await expect(page.getByRole("link", { name: "Create a free account" })).toHaveAttribute("href", "/sign-up?callbackUrl=%2Fmodules%2Ftalking-to-ai%2Fcertificate");
  await page.goto("/sign-in");
  await expect(page.getByRole("link", { name: /Back to Module 1/ })).toBeVisible();
  await signIn(context);
  await passUpTo(context, "talking-to-ai", "final-assessment");
  await page.goto("/modules/talking-to-ai");
  await expect(page.getByRole("link", { name: /Next module · Staying Safe with AI \(coming soon\)/ })).toBeVisible();
  await page.goto("/modules/staying-safe-with-ai");
  await expect(page.getByText(/This module is being made/)).toBeVisible();
  await page.goto("/modules/talking-to-ai/lessons/the-grant-that-didnt-exist");
  await expect(page.getByText(/You've reached the end of the module/)).toBeVisible();
});

test("Module 2 films stop at the choice and ask, then carry on", async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    await passUpTo(context, "talking-to-ai", "thirty-pages-by-friday");
    const page = await context.newPage();
    await page.goto("/modules/talking-to-ai/lessons/thirty-pages-by-friday");
    const video = page.locator("video");
    await expect(video).toBeVisible();
    // Simulate the film playing past the end of its "choice" scene (51.34 s).
    const tick = (time: number) =>
      video.evaluate((v, t) => {
        Object.defineProperty(v, "currentTime", { configurable: true, get: () => t, set: () => undefined });
        v.dispatchEvent(new Event("timeupdate"));
      }, time);
    await tick(50.9);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await tick(51.5);
    const dialog = page.getByRole("dialog", { name: "Would you send it? What should Maya do?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading")).toBeFocused();
    await dialog.getByRole("button", { name: /Send it to Rosa now/ }).click();
    await expect(dialog.getByText(/Not quite/)).toBeVisible();
    await dialog.getByRole("button", { name: /Open the guide and check/ }).click();
    await expect(dialog.getByText("✓ Right.")).toBeVisible();
    await page.waitForTimeout(600);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await dialog.getByRole("button", { name: /Continue the film/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    // It does not ask again straight away, only after going back before the choice.
    await tick(52.5);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await context.close();
  }
  // Module 1 films have no pop-up.
  const learner = await browser.newContext();
  await signIn(learner);
  const page = await learner.newPage();
  await page.goto("/modules/ai-foundations/lessons/what-counts-as-ai");
  await page.locator("video").evaluate((v) => {
    Object.defineProperty(v, "currentTime", { configurable: true, get: () => 236.5, set: () => undefined });
    v.dispatchEvent(new Event("timeupdate"));
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await learner.close();
});

test("Episode 2.1's film asks its approved question at 1:15", async ({ page, context }) => {
  await signIn(context);
  await passUpTo(context, "talking-to-ai", "a-new-helper");
  await page.goto("/modules/talking-to-ai/lessons/a-new-helper");
  const tick = (time: number) =>
    page.locator("video").evaluate((v, t) => {
      Object.defineProperty(v, "currentTime", { configurable: true, get: () => t, set: () => undefined });
      v.dispatchEvent(new Event("timeupdate"));
    }, time);
  await tick(75);
  await tick(75.7);
  const dialog = page.getByRole("dialog", { name: /enough to trust what it says/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /Check the details someone will rely on/ }).click();
  await expect(dialog.getByText("✓ Right.")).toBeVisible();
});

test("AI for Testers page shows the programme and saves early-access sign-ups", async ({ browser }) => {
  const email = `qa-waitlist-${randomUUID()}@example.com`;
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      // Reached from the "choose a path" list.
      await page.goto("/curriculum");
      await page.getByRole("link", { name: "AI for Testers" }).click();
      await expect(page).toHaveURL(/\/testers$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("You don't need Python to build with AI.");
      await expect(page.getByRole("heading", { name: "Using AI and testing AI are two different jobs." })).toBeVisible();
      await expect(page.locator("#curriculum ol > li")).toHaveCount(6);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const consent = page.getByRole("button", { name: "No thanks" });
      if (await consent.isVisible().catch(() => false)) await consent.click();
      await page.waitForTimeout(600);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

      await page.getByRole("link", { name: "Get early access" }).click();
      await page.getByLabel("Email").fill(email.toUpperCase());
      await page.getByLabel("Where you're starting from").selectOption("QA lead or manager");
      await page.getByRole("button", { name: "Get early access" }).click();
      await expect(page.getByText("You're on the list.")).toBeVisible();
      await context.close();
    }
    // Stored once, lower-cased; signing up again only updated the row.
    const rows = await sql`SELECT role FROM waitlist_signups WHERE list='ai-for-testers' AND email=${email}`;
    expect(rows).toEqual([{ role: "QA lead or manager" }]);
  } finally {
    await sql`DELETE FROM waitlist_signups WHERE email=${email}`;
    await sql.end();
  }
});

test("the dashboard shows where the learner is, time to the next certificate and recent results", async ({ browser }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    const page = await context.newPage();

    // Logging in with no page to return to lands on the dashboard.
    await page.goto("/sign-in");
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Welcome, Test", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start learning" })).toHaveAttribute("href", lesson());
    await expect(page.getByText("Time to your Essentials certificate")).toBeVisible();
    await expect(page.getByText("0 of 12", { exact: true })).toBeVisible();
    await expect(page.getByText("Your knowledge check results will show here.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Talking to AI/ }).locator("..").locator("..")).toContainText("Locked");

    await passUpTo(context, "ai-foundations", "before-chatgpt");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Welcome back, Test", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Continue/ })).toHaveAttribute("href", lesson("before-chatgpt"));
    await expect(page.getByText("2 of 12", { exact: true })).toBeVisible();
    await expect(page.getByText("Lesson 2 knowledge check")).toBeVisible();
    await expect(page.getByRole("progressbar", { name: "Module 1 progress" })).toHaveAttribute("aria-valuetext", "2 of 6 done");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Settings are one tap away, and lead back.
    await page.getByRole("link", { name: /Open settings/ }).click();
    await expect(page.getByRole("heading", { name: "Your account", level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /Your dashboard/ }).first().click();
    await expect(page).toHaveURL(`${base}/dashboard`);
    if (viewport.width < 768) await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("link", { name: "Dashboard" }).first()).toBeVisible();
    await context.close();
  }

  // Signed out: the dashboard asks for a login and comes back.
  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto("/dashboard");
  await expect(guestPage).toHaveURL(`${base}/sign-in?callbackUrl=%2Fdashboard`);
  await guest.close();
});

test("forum: read without an account, ask from a lesson, answer, comment, mark helpful, accept and report", async ({ browser }) => {
  test.setTimeout(90_000);
  // Anyone can read; posting asks for a login.
  const visitor = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const look = await visitor.newPage();
  await look.goto("/forum");
  await expect(look.getByRole("heading", { name: "Community forum", level: 1 })).toBeVisible();
  await expect(look.getByRole("region", { name: "Sections" }).getByRole("link", { name: /Module 1: Foundations of AI/ })).toBeVisible();
  expect(await look.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page: look }).analyze()).violations).toEqual([]);
  await look.getByRole("link", { name: "Ask a question" }).click();
  await expect(look).toHaveURL(/\/sign-in\?callbackUrl=%2Fforum%2Fnew/);

  // Ada asks from Lesson 1: the section and lesson are already chosen.
  const ada = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await signIn(ada);
  const page = await ada.newPage();
  // Reading is open, but posting waits for a first knowledge check.
  await page.goto("/forum/new?section=ai-foundations");
  await expect(page.getByText("Take your first knowledge check to join in")).toBeVisible();
  await expect(page.getByRole("button", { name: "Post it" })).toHaveCount(0);
  await submitWrongCheck(ada);
  await page.goto(lesson());
  await expect(page.getByRole("heading", { name: "Questions about this lesson?" })).toBeVisible();
  await page.getByRole("region", { name: "Questions about this lesson?" }).getByRole("link", { name: "Ask a question" }).click();
  await expect(page.getByLabel("Section")).toHaveValue("ai-foundations");
  await expect(page.getByLabel(/Is it about a lesson/)).toHaveValue("what-counts-as-ai");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const title = `Is a spam filter AI? ${randomUUID().slice(0, 8)}`;
  await page.getByLabel(/^Title/).fill("Short");
  await page.getByLabel(/^Details/).fill("I'm not sure whether my email spam filter counts as AI. What do you think?");
  await page.getByLabel(/^Title/).evaluate((el: HTMLInputElement) => el.removeAttribute("minlength"));
  await page.getByRole("button", { name: "Post it" }).click();
  await expect(page.getByText("Write a title of at least 8 characters.")).toBeVisible();
  await expect(page.getByLabel(/^Details/)).toHaveValue(/spam filter counts as AI/, { timeout: 5000 });
  await page.getByLabel(/^Title/).fill(title);
  await page.getByRole("button", { name: "Post it" }).click();
  await expect(page.getByText("Posted. Thanks for starting the conversation.")).toBeVisible();
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /About Module 1, Lesson 1: What is AI\?/ })).toBeVisible();
  await expect(page.getByRole("main").getByText("Test L.").first()).toBeVisible();
  const threadUrl = page.url().split("?")[0];

  // Ben answers and Ada comments; links work, HTML never runs.
  const ben = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await signIn(ben);
  await submitWrongCheck(ben);
  const benPage = await ben.newPage();
  await benPage.goto(threadUrl);
  await benPage.getByRole("textbox", { name: "Your answer" }).fill("Yes! It learns from examples. <b>not bold</b> See https://example.com/spam for more.");
  await benPage.getByRole("button", { name: "Post answer" }).click();
  await expect(benPage.getByRole("heading", { name: "1 answer" })).toBeVisible();
  await expect(benPage.locator("p", { hasText: "<b>not bold</b>" })).toBeVisible();
  await expect(benPage.locator("main b")).toHaveCount(0);
  await expect(benPage.getByRole("link", { name: /https:\/\/example.com\/spam/ })).toHaveAttribute("rel", "nofollow ugc noopener noreferrer");
  await benPage.getByRole("button", { name: /^Like/ }).first().click();
  await expect(benPage.getByRole("button", { name: /^✓ Like · 1/ })).toBeVisible();

  await page.reload();
  await page.getByText("Add a comment").click();
  await page.getByLabel("Your comment").fill("Thanks Ben, that makes sense.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.locator("p", { hasText: "Thanks Ben, that makes sense." })).toBeVisible();
  await page.getByRole("button", { name: /Mark as the answer that helped/ }).click();
  await expect(page.getByText("✓ The answer that helped")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Ben reports the comment; the section list shows the question as answered.
  await benPage.reload();
  await benPage.locator("summary", { hasText: "Report comment" }).click();
  const reportForm = benPage.locator("details[open] form");
  await reportForm.getByLabel("Unkind or rude").check();
  await reportForm.getByRole("button", { name: "Send report" }).click();
  await expect(benPage.getByText("Thanks for telling us.")).toBeVisible();
  await benPage.goto("/forum/ai-foundations?filter=questions");
  await expect(benPage.getByRole("link", { name: title })).toContainText("✓ Answered");
  expect((await new AxeBuilder({ page: benPage }).analyze()).violations).toEqual([]);

  // Ben replies to Ada's comment; the reply starts with her name.
  await benPage.goto(threadUrl);
  await benPage.locator("summary", { hasText: "Reply to Test L." }).click();
  await expect(benPage.getByLabel("Your reply to Test L.")).toHaveValue("@Test L. ");
  await benPage.getByLabel("Your reply to Test L.").fill("@Test L. Glad it helped!");
  await benPage.getByRole("button", { name: "Post reply" }).click();
  await expect(benPage.locator("p", { hasText: "@Test L. Glad it helped!" })).toBeVisible();

  // From the module page and after a check, there's a way into the forum.
  await benPage.goto("/modules/ai-foundations");
  await expect(benPage.getByRole("heading", { name: "Talk about Module 1" })).toBeVisible();
  await expect(benPage.getByRole("region", { name: "Talk about Module 1" }).getByRole("link", { name: title })).toBeVisible();
  await benPage.getByRole("region", { name: "Talk about Module 1" }).getByRole("link", { name: /View forum/ }).click();
  await expect(benPage).toHaveURL(`${base}/forum/ai-foundations`);
  await benPage.goto(`/forum/ai-foundations?lesson=what-counts-as-ai`);
  await expect(benPage.getByText(/Showing posts about/)).toBeVisible();
  await expect(benPage.getByRole("link", { name: "Back to the lesson" })).toHaveAttribute("href", lesson());

  // The visitor can read it all but not reply.
  await look.goto(threadUrl);
  await expect(look.getByText("Thanks Ben, that makes sense.")).toBeVisible();
  await expect(look.getByRole("link", { name: "create a free account" })).toBeVisible();
  await expect(look.getByRole("textbox", { name: "Your answer" })).toHaveCount(0);
  for (const c of [visitor, ada, ben]) await c.close();
});

test("learners can choose their language in settings; languages not ready yet are greyed out", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await signIn(context);
  const page = await context.newPage();
  await page.goto("/account");
  const section = page.getByRole("region", { name: "Language" });
  await expect(section.getByRole("radio", { name: "English" })).toBeChecked();
  await expect(section.getByText(/Lessons are in English for now/)).toBeVisible();
  await expect(section.getByRole("radio", { name: /Français/ })).toBeDisabled();
  await expect(section.getByText("Not ready yet")).toHaveCount(11);
  await section.getByRole("button", { name: "Save language" }).click();
  await expect(section.getByText("Language saved.")).toBeVisible();
  expect((await context.cookies(base)).find((c) => c.name === "buggle_lang")?.value).toBe("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await context.close();
});

test("organisations: create, test plan, invite, join, team progress, logo, join link and leaving", async ({ browser }) => {
  test.setTimeout(120_000);
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const name = `QA Org ${randomUUID().slice(0, 6)}`;
  await sql`UPDATE org_plans SET price_per_seat_year = 2400, currency = 'usd', active = true WHERE code = 'content'`;
  try {
    // The public plans page shows the price set by admins.
    const owner = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await signIn(owner);
    const page = await owner.newPage();
    await page.goto("/organisations");
    await expect(page.getByRole("heading", { name: "Buggle content" })).toBeVisible();
    await expect(page.getByText("$24.00")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // Create it, then switch on a test plan (no Stripe keys on test sites).
    await page.getByRole("link", { name: /Create an organisation/ }).click();
    await page.getByLabel("Organisation name").fill(name);
    await page.getByRole("button", { name: "Create organisation" }).click();
    await expect(page.getByText(/Your organisation is ready/)).toBeVisible();
    await expect(page.getByText(/Test site:/)).toBeVisible();
    await page.getByLabel("Number of places").fill("3");
    await page.getByRole("button", { name: "Switch on test plan" }).click();
    await expect(page.getByText(/Test plan switched on/)).toBeVisible();
    await expect(page.getByText("1 used of 3")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    const slug = new URL(page.url()).pathname.split("/")[2];

    // Invite Ben by email; the link is shown once, and never in the address bar.
    const ben = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const benId = await signIn(ben);
    const benEmail = emails.get(benId)!;
    await page.getByRole("navigation", { name: "Organisation" }).getByRole("link", { name: "Members" }).click();
    await page.getByLabel("Their email").fill(benEmail);
    await page.getByRole("button", { name: "Create invite" }).click();
    const link = await page.getByLabel("Invite link").inputValue();
    expect(link).toMatch(/\/join\/[A-Za-z0-9_-]{40,}$/);
    expect(page.url()).not.toContain("/join/");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    const benPage = await ben.newPage();
    await benPage.goto(link);
    await expect(benPage.getByRole("heading", { name: `Join ${name}` })).toBeVisible();
    await benPage.getByRole("button", { name: `Join ${name}` }).click();
    await expect(benPage.getByText("Welcome! You've joined.")).toBeVisible();
    await expect(benPage.getByRole("heading", { name: `You're learning with ${name}` })).toBeVisible();
    await expect(benPage.getByRole("navigation", { name: "Organisation" })).toHaveCount(0);
    expect(await benPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    // Members can't open the manager pages.
    await benPage.goto(`/org/${slug}/members`);
    await expect(benPage).toHaveURL(`${base}/org/${slug}`);

    // The owner sees Ben's progress after he passes Lesson 1.
    await passUpTo(ben, "ai-foundations", "ai-in-your-day");
    await page.goto(`/org/${slug}`);
    await expect(page.getByRole("progressbar", { name: "Test learner's progress" }).last()).toHaveAttribute("aria-valuetext", "1 of 12 steps");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // A join link, and a logo that members see on their dashboard.
    await page.goto(`/org/${slug}/members`);
    await page.getByRole("button", { name: "Make a join link" }).click();
    await expect(page.getByRole("textbox", { name: "Join link" })).toHaveValue(/\/join\//);
    await page.goto(`/org/${slug}/settings`);
    const png = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082", "hex");
    await page.getByLabel(/^Logo/).setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: png });
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();
    await benPage.goto("/dashboard");
    await expect(benPage.getByRole("img", { name: `${name} logo` })).toBeVisible();

    // Ben leaves.
    await benPage.goto(`/org/${slug}`);
    await benPage.getByRole("button", { name: `Leave ${name}` }).click();
    await expect(benPage).toHaveURL(/\/dashboard/);
    await page.goto(`/org/${slug}/billing`);
    await expect(page.getByText("1 used of 3")).toBeVisible();
    await owner.close();
    await ben.close();
  } finally {
    await sql`DELETE FROM organisations WHERE name = ${name}`;
    await sql`UPDATE org_plans SET price_per_seat_year = 0, active = false`;
    await sql.end();
  }
});

test("lesson builder: an organisation builds a course with blocks and a check, and a member takes it in order", async ({ browser }) => {
  test.setTimeout(150_000);
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const name = `QA Builders ${randomUUID().slice(0, 6)}`;
  const slug = `qa-builders-${randomUUID().slice(0, 8)}`;
  try {
    const owner = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const ownerId = await signIn(owner);
    const member = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const memberId = await signIn(member);
    const [org] = await sql`INSERT INTO organisations(slug, name, plan, seats, status, created_by)
      VALUES(${slug}, ${name}, 'platform', 3, 'test', ${ownerId}) RETURNING id`;
    await sql`INSERT INTO organisation_members(org_id, user_id, role) VALUES(${org.id}, ${ownerId}, 'owner'), (${org.id}, ${memberId}, 'member')`;

    // The owner starts a course from the organisation's Courses tab.
    const page = await owner.newPage();
    await page.goto(`/org/${slug}`);
    await page.getByRole("navigation", { name: "Organisation" }).getByRole("link", { name: "Courses" }).click();
    await page.getByLabel("Course title").fill("Safe AI at work");
    await page.getByRole("button", { name: "Create course" }).click();
    await expect(page.getByText(/Course created/)).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    // Publishing an empty course is refused, and nothing typed is lost.
    await page.getByLabel("What learners will get from it").fill("How we use AI safely here.");
    await page.getByLabel(/Published: learners can see it/).check();
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText("Add at least one lesson");
    await expect(page.getByLabel("What learners will get from it")).toHaveValue("How we use AI safely here.");

    // First lesson: text, a video and an image, then a one-question check.
    await page.getByLabel("New lesson title").fill("What not to paste");
    await page.getByRole("button", { name: "+ Add lesson" }).click();
    await expect(page.getByText(/Lesson added/)).toBeVisible();
    await page.getByLabel("Minutes to complete").fill("5");
    await page.getByRole("button", { name: "Save lesson details" }).click();
    await expect(page.getByText("Lesson saved.")).toBeVisible();

    await page.getByRole("button", { name: "+ Add block" }).click();
    const text = page.getByRole("listitem", { name: "Block 1: Text" });
    await text.getByLabel("Heading (optional)").fill("Keep it private");
    await text.getByLabel(/^Text/).fill("Never paste customer names into a chatbot.\n\n<b>Not bold</b>, just text.");
    await text.getByRole("button", { name: "Save block" }).click();
    await expect(page.getByText("Block saved.")).toBeVisible();

    await page.getByLabel("Add a block").selectOption("video");
    await page.getByRole("button", { name: "+ Add block" }).click();
    const video = page.getByRole("listitem", { name: "Block 2: Video" });
    await video.getByLabel(/YouTube or Vimeo link/).fill("https://example.com/clip");
    await video.getByRole("button", { name: "Save block" }).click();
    await expect(video.getByRole("alert")).toContainText("Use a YouTube or Vimeo link.");
    await expect(video.getByLabel(/YouTube or Vimeo link/)).toHaveValue("https://example.com/clip");
    await video.getByLabel(/YouTube or Vimeo link/).fill("https://youtu.be/dQw4w9WgXcQ");
    await video.getByLabel(/Video title/).fill("Two-minute explainer");
    await video.getByRole("button", { name: "Save block" }).click();
    await expect(page.getByText("Block saved.")).toBeVisible();

    await page.getByLabel("Add a block").selectOption("image");
    await page.getByRole("button", { name: "+ Add block" }).click();
    const image = page.getByRole("listitem", { name: "Block 3: Image" });
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await image.getByLabel(/^Image/).setInputFiles({ name: "dot.png", mimeType: "image/png", buffer: png });
    await image.getByLabel(/Describe the image/).fill("A single purple dot");
    await image.getByRole("button", { name: "Save block" }).click();
    await expect(page.getByText("Block saved.")).toBeVisible();
    await expect(page.getByRole("img", { name: "A single purple dot" })).toBeVisible();

    // The image moves above the video.
    await page.getByRole("button", { name: "Move block 3 up" }).click();
    await expect(page.getByRole("listitem", { name: "Block 2: Image" })).toBeVisible();

    const check = page.locator("#check");
    await check.getByLabel("Question", { exact: true }).fill("Which is safe to paste into a chatbot?");
    await check.getByLabel("Answer 1", { exact: true }).fill("A public news article");
    await check.getByLabel("Answer 2", { exact: true }).fill("A customer's name and address");
    await check.getByLabel("Answer 1 is the right one").check();
    await check.getByLabel(/^Explanation/).fill("Public text is fine; personal details are not.");
    await check.getByRole("button", { name: "Save all questions" }).click();
    await expect(page.getByText("Knowledge check saved.")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    // The preview shows what learners will see, as plain text.
    await page.getByRole("link", { name: "Preview this lesson" }).click();
    await expect(page.getByRole("heading", { name: "Keep it private" })).toBeVisible();
    await expect(page.getByText("<b>Not bold</b>, just text.")).toBeVisible();
    await expect(page.locator('iframe[title="Two-minute explainer"]')).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    await expect(page.getByText(/knowledge check with 1 question/)).toBeVisible();
    expect((await new AxeBuilder({ page }).exclude("iframe").analyze()).violations).toEqual([]);

    // A second lesson with no check, then publish.
    await page.getByRole("link", { name: "Back to editing" }).click();
    await page.getByRole("link", { name: "← Back to the course" }).click();
    await page.getByLabel("New lesson title").fill("Who to ask");
    await page.getByRole("button", { name: "+ Add lesson" }).click();
    await page.getByRole("button", { name: "+ Add block" }).click();
    await page.getByRole("listitem", { name: "Block 1: Text" }).getByLabel(/^Text/).fill("Ask your manager first.");
    await page.getByRole("button", { name: "Save block" }).click();
    await expect(page.getByText("Block saved.")).toBeVisible();
    await page.getByRole("link", { name: "← Back to the course" }).click();
    await page.getByLabel(/Published: learners can see it/).check();
    await page.getByRole("button", { name: "Save course" }).click();
    await expect(page.getByText(/Course published/)).toBeVisible();

    // Someone outside the organisation can't see it, or open the builder.
    const outsider = await browser.newContext();
    await signIn(outsider);
    const outsiderPage = await outsider.newPage();
    await outsiderPage.goto("/courses");
    await expect(outsiderPage.getByText("Safe AI at work")).toHaveCount(0);
    const courseLink = await page.getByRole("link", { name: "Open as a learner" }).getAttribute("href");
    expect((await outsiderPage.goto(courseLink!))!.status()).toBe(404);
    expect((await outsiderPage.goto(`/org/${slug}/courses`))!.status()).toBe(404);
    await outsider.close();

    // The member takes it on a phone, one lesson at a time.
    const m = await member.newPage();
    await m.goto("/courses");
    await expect(m.getByText(`From ${name}`)).toBeVisible();
    expect((await new AxeBuilder({ page: m }).analyze()).violations).toEqual([]);
    await m.getByRole("link", { name: /Open course/ }).click();
    await expect(m.getByRole("heading", { name: "Safe AI at work" })).toBeVisible();
    await expect(m.getByText("Finish the lesson before first")).toBeVisible();
    expect((await new AxeBuilder({ page: m }).analyze()).violations).toEqual([]);
    expect(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await m.getByRole("link", { name: /Start the course/ }).click();
    await expect(m.getByRole("heading", { name: "What not to paste" })).toBeVisible();
    await expect(m.getByText("About 5 minutes")).toBeVisible();
    await m.getByRole("button", { name: "Open the knowledge check" }).click();
    await m.getByLabel("A customer's name and address").check();
    await m.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(m.getByText("Review the feedback and try again", { exact: true })).toBeVisible();
    await m.getByRole("button", { name: "Retry this assessment", exact: true }).click();
    await m.getByLabel("A public news article").check();
    await m.getByRole("button", { name: "Submit knowledge check" }).click();
    await expect(m.getByText("Knowledge check passed", { exact: true })).toBeVisible();
    expect((await new AxeBuilder({ page: m }).exclude("iframe").analyze()).violations).toEqual([]);
    expect(await m.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await m.getByRole("link", { name: /Next lesson: Who to ask/ }).click();
    await expect(m.getByText("Ask your manager first.")).toBeVisible();
    await m.getByRole("button", { name: "Mark as done" }).click();
    await expect(m.getByText(/finished every lesson in this course/)).toBeVisible();
    await expect(m.getByText("2 of 2 lessons done")).toBeVisible();

    // Members can't open the builder.
    await m.goto(`/org/${slug}/courses`);
    await expect(m).toHaveURL(`${base}/org/${slug}`);
    await owner.close();
    await member.close();
  } finally {
    await sql`DELETE FROM courses WHERE organization_id IN (SELECT id::text FROM organisations WHERE slug = ${slug})`;
    await sql`DELETE FROM organisations WHERE slug = ${slug}`;
    await sql.end();
  }
});

test("the header shows the learner's short name and photo; photos can be added and removed in settings", async ({ browser }) => {
  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    const page = await context.newPage();
    await page.goto("/dashboard");
    const phone = viewport.width < 1024;
    if (phone) await page.getByRole("button", { name: "Menu" }).click();
    const accountLink = page.getByRole("banner").getByRole("link", { name: /Your account/ }).filter({ visible: true });
    if (!phone) {
      await expect(accountLink).toContainText("Test L.");
      await expect(accountLink.getByText("TL", { exact: true })).toBeVisible();
    } else await expect(page.getByText("Signed in as Test L.")).toBeVisible();
    await accountLink.click();

    // Settings: sections menu, then add a photo. It's made into a small square in the browser.
    await expect(page.getByRole("navigation", { name: "Settings sections" }).getByRole("link")).toHaveCount(6);
    await expect(page.getByRole("img", { name: "Your initials, Test learner" })).toBeVisible();
    const canvasPng = await page.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = 900;
      c.height = 600;
      const x = c.getContext("2d")!;
      x.fillStyle = "#7155d9";
      x.fillRect(0, 0, 900, 600);
      const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    });
    await page.getByLabel("Choose a photo").setInputFiles({ name: "me.png", mimeType: "image/png", buffer: Buffer.from(canvasPng) });
    await expect(page.getByRole("img", { name: "Your new photo, not saved yet" })).toBeVisible();
    await page.getByRole("button", { name: "Save photo" }).click();
    await expect(page.getByText("Your photo has been saved.")).toBeVisible();
    const photo = page.getByRole("img", { name: "Your profile photo" });
    await expect(photo).toBeVisible();
    const src = (await photo.getAttribute("src"))!;
    expect(src).toMatch(/^\/api\/avatars\/[0-9a-f-]{36}$/);
    const served = await context.request.get(base + src);
    expect(served.headers()["content-type"]).toBe("image/jpeg");
    expect((await served.body()).length).toBeLessThan(60_000);
    if (!phone) await expect(page.getByRole("link", { name: "Your account: Test L." }).locator(`img[src="${src}"]`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole("button", { name: "Remove photo" }).click();
    await expect(page.getByText(/Your photo has been removed/)).toBeVisible();
    expect((await context.request.get(base + src)).status()).toBe(404);
    await context.close();
  }
});

test("rewards: points and badges for passing checks, a leaderboard, and hiding from it", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await signIn(context);
  await passUpTo(context, "ai-foundations", "ai-in-your-day");
  const page = await context.newPage();

  await page.goto("/dashboard");
  const points = page.getByRole("region", { name: "Your points" });
  await expect(points.getByText("This week")).toBeVisible();
  await expect(points.locator("dd").first()).toHaveText("15");
  await points.getByRole("link", { name: "See the leaderboard" }).click();

  await expect(page.getByRole("heading", { name: "Leaderboard", level: 1 })).toBeVisible();
  await expect(page.getByText(/never change your scores or certificates/)).toBeVisible();
  const me = page.locator("li", { hasText: "You" }).filter({ hasText: "Test L." });
  await expect(me).toContainText("15");
  await expect(page.getByRole("listitem").filter({ hasText: "Bullseye (earned)" })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "First question (not yet)" })).toBeVisible();
  // How to earn points is folded away until opened.
  await expect(page.getByRole("cell", { name: "Ask a question in the forum" })).toBeHidden();
  await page.getByText("How to earn points").click();
  await expect(page.getByRole("cell", { name: "Ask a question in the forum" })).toBeVisible();
  await page.getByRole("link", { name: "All time" }).click();
  await expect(page.getByRole("heading", { name: "All time" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Hiding from leaderboards keeps the points but takes the learner off the list.
  await page.goto("/account#profile");
  await page.getByLabel(/Show me on leaderboards/).uncheck();
  await page.getByRole("region", { name: "Profile" }).getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(/You're hidden from leaderboards/)).toBeVisible();
  await page.goto("/leaderboard");
  await expect(page.getByText(/You're hidden from leaderboards, so other people/)).toBeVisible();
  await expect(page.locator("li", { hasText: "Test L." }).filter({ hasText: "You" })).toHaveCount(0);
  await context.close();
});

test("dark mode: follows the device, can be switched and saved, and the main pages stay readable", async ({ browser }) => {
  test.setTimeout(150_000);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
  await signIn(context);
  const page = await context.newPage();
  const pages = ["/", "/welcome", "/curriculum", "/modules/ai-foundations", "/forum", "/organisations", "/dashboard", "/account", "/leaderboard", "/courses", "/verify", "/nothing-here"];
  for (const path of pages) {
    await page.goto(path);
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), path).toBe("rgb(15, 20, 36)");
    const { violations } = await new AxeBuilder({ page }).exclude("iframe").analyze();
    expect(violations.map((v) => `${path}: ${v.id} ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
  }

  // The header button switches to light, and the choice is kept on this device.
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(246, 245, 251)");

  // Settings: back to following the device.
  await page.goto("/account#appearance");
  await expect(page.getByRole("radio", { name: /^Light/ })).toBeChecked();
  await page.getByRole("radio", { name: /Same as my device/ }).check();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /./);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(15, 20, 36)");
  await context.close();
});
