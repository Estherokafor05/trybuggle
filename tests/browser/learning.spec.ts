import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { encode } from "next-auth/jwt";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { assessmentBank, moduleAssessmentBank } from "../../src/server/assessment-bank";

process.loadEnvFile(".env.local");
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Integration fixtures must run against a local application.");
const lesson = (slug = "what-counts-as-ai") =>
  `/modules/ai-foundations/lessons/${slug}`;
const users: string[] = [];
async function signIn(
  context: import("@playwright/test").BrowserContext,
  id = `qa-learning-${randomUUID()}`,
) {
  if (!users.includes(id)) users.push(id);
  const cookie = await encode({
    token: { sub: randomUUID(), learnerId: id, name: "Test learner" },
    secret: process.env.AUTH_SECRET!,
    salt: "authjs.session-token",
    maxAge: 3600,
  });
  await context.addCookies([
    {
      name: "authjs.session-token",
      value: cookie,
      url: base,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return id;
}
test.afterAll(async () => {
  if (!users.length) return;
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM certificates WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM module_assessment_attempts WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM learning_checkpoints WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM assessment_attempts WHERE learner_id IN ${tx(users)}`;
      await tx`DELETE FROM learners WHERE id IN ${tx(users)}`;
    });
  } finally {
    await sql.end();
  }
});
test("Lesson 1 supports both routes, all activities and local resume", async ({
  page,
}) => {
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
}) => {
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
  expect(publicQuestions.questions).toHaveLength(10);
  expect(
    publicQuestions.questions.every(
      (q: object) => !("correct" in q) && !("explanation" in q),
    ),
  ).toBe(true);
  const questions = assessmentBank["what-counts-as-ai"];
  for (const numberCorrect of [6, 7]) {
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
    expect(result.passed).toBe(numberCorrect === 7);
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
        `input[name="${q.id}"][value="${i < 6 ? q.correct : q.options.find((o) => o.id !== q.correct)!.id}"]`,
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

test("guest progress carries into sign-in and a newer-device save can be restored", async ({
  page,
  context,
  browser,
}) => {
  await page.goto(lesson());
  await page
    .getByRole("button", { name: /^Read & Explore/ })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  const id = await signIn(context);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Automatic or AI?" }),
  ).toBeVisible();
  await expect(
    page.getByText("Saved to your account", { exact: true }),
  ).toBeVisible({ timeout: 10000 });
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

test("Lesson 3 needs sign-in, then both routes, every activity and the check work", async ({
  browser,
}) => {
  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  await guestPage.goto(lesson("before-chatgpt"));
  await expect(guestPage).toHaveURL(/\/sign-in\?callbackUrl=/);
  await guestPage.goto(lesson("before-chatgpt") + "/reading");
  await expect(guestPage).toHaveURL(/\/sign-in\?callbackUrl=/);
  await guestPage.goto(lesson("ai-in-your-day"));
  await expect(
    guestPage.getByRole("heading", { name: /Up next: Lesson 3/ }),
  ).toBeVisible();
  await expect(
    guestPage.getByRole("link", { name: "Continue with Google" }).first(),
  ).toHaveAttribute("href", /callbackUrl=%2Fmodules%2Fai-foundations%2Flessons%2Fbefore-chatgpt/);
  await guest.close();

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
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
    expect(questions).toHaveLength(10);
    for (const q of questions)
      await expect(page.locator(`input[name="${q.id}"]`)).toHaveCount(q.options.length);
    await context.close();
  }

  const reader = await browser.newContext();
  await signIn(reader);
  const readingPage = await reader.newPage();
  await readingPage.goto(lesson("before-chatgpt") + "/reading");
  await expect(readingPage.getByRole("heading", { name: "The AI Time Machine" })).toBeVisible();
  await expect(readingPage.getByRole("heading", { level: 2 })).toHaveCount(7);
  await reader.close();
});

test("Lessons 4 and 5: every activity, the previous-check notice and accessibility", async ({
  browser,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    await signIn(context);
    const page = await context.newPage();

    // Lesson 4: Step into Daniel's reception
    await page.goto(lesson("ai-or-software"));
    await expect(page.getByRole("heading", { name: "AI or Ordinary Software?", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /haven't passed Lesson 3's knowledge check/ })).toBeVisible();
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

    // Lesson 5: Help Amina hire fairly
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
    await context.close();
  }
});

test("final assessment, certificate eligibility, naming and PDF download", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const id = await signIn(context);
  const page = await context.newPage();
  const final = moduleAssessmentBank["ai-foundations"];
  expect(final).toHaveLength(8);

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
  await page.getByRole("button", { name: "Retry this assessment" }).click();
  await answer(6);
  await expect(page.getByText("Final assessment passed")).toBeVisible();
  await expect(page.getByText("6 of 8 correct")).toBeVisible();
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  // Not eligible yet: no lesson checks passed, and the server refuses to issue.
  await page.goto("/modules/ai-foundations/certificate");
  await expect(page.getByText("You're nearly there.")).toBeVisible();
  await expect(page.getByText("1 of 6 done")).toBeVisible();
  const refused = await context.request.post(base + "/api/me/certificates/ai-foundations", {
    headers: { Origin: base },
    data: { name: "Test learner" },
  });
  expect(refused.status()).toBe(403);

  // Pass every lesson check through the official API.
  for (const slug of ["what-counts-as-ai", "ai-in-your-day", "before-chatgpt", "ai-or-software", "what-ai-can-do"]) {
    const answers = Object.fromEntries(assessmentBank[slug].map((q) => [q.id, q.correct]));
    const response = await context.request.post(`${base}/api/assessments/${slug}/submissions`, {
      headers: { Origin: base },
      data: { version: 1, submissionKey: randomUUID(), answers },
    });
    expect(response.status()).toBe(200);
  }

  // Eligible: the name starts as the profile name and can be changed before creating.
  await page.reload();
  await expect(page.getByText("6 of 6 done")).toBeVisible();
  const nameField = page.getByLabel("Name on your certificate");
  await expect(nameField).toHaveValue("Test learner");
  await nameField.fill("Ada Testwoman");
  await page.getByRole("button", { name: "Create my certificate" }).click();
  await expect(page.getByText("Your certificate is ready.")).toBeVisible();
  await expect(page.getByText("Ada Testwoman")).toBeVisible();
  const code = (await page.locator("dd.font-mono").textContent())!;
  expect(code).toMatch(/^BL-M1-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

  // Edit the name: ID stays the same.
  await page.getByRole("button", { name: "Edit name" }).click();
  await page.getByLabel("Name on your certificate").fill("Ada T. Learner");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByText(/Name updated/)).toBeVisible();
  await expect(page.locator("dd.font-mono")).toHaveText(code);
  expect(
    (await (await context.request.post(base + "/api/me/certificates/ai-foundations", { headers: { Origin: base }, data: { name: "Someone Else" } })).json())
      .certificate.code,
  ).toBe(code);

  // The PDF downloads for the owner only.
  const pdf = await context.request.get(base + "/api/me/certificates/ai-foundations/pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const other = await browser.newContext();
  await signIn(other);
  expect((await other.request.get(base + "/api/me/certificates/ai-foundations/pdf")).status()).toBe(404);
  expect((await (await other.request.get(base + "/api/me/certificates/ai-foundations")).json()).certificate).toBeNull();
  await other.close();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.waitForTimeout(800);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  void id;
  await context.close();
});
