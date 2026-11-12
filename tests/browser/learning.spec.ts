import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { encode } from "next-auth/jwt";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { assessmentBank } from "../../src/server/assessment-bank";

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
    page.getByRole("button", { name: "Read & Explore", exact: true }),
  ).toBeEnabled();
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState))
    .toBeGreaterThan(0);
  await video.evaluate((v: HTMLVideoElement) => {
    v.currentTime = 48;
  });
  await page
    .getByRole("button", { name: "Play film with narration", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Read & Explore", exact: true })
    .click();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
    .toBe(true);
  await page
    .getByRole("button", { name: "Turn spoken words into notes", exact: true })
    .click();
  await expect(
    page.getByText("A recording of someone speaking", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Advance five minutes" }).click();
  await expect(page.getByText("Ring! The set time has passed.")).toBeVisible();
  await page
    .getByRole("button", { name: "See the speech-tool demonstration" })
    .click();
  await expect(
    page.getByText("Written reminder: Bring a notebook."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByRole("button", { name: "A meeting recording", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Written notes", exact: true })
    .click();
  await expect(page.getByText("✓ Connected", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByRole("button", { name: "Try a partly hidden animal" })
    .click();
  await expect(page.getByText(/This prediction is wrong/)).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByLabel("Invite volunteers to a meeting", { exact: true })
    .check();
  await page.getByLabel("Thursday, 6 pm, Room Three", { exact: true }).check();
  await page.getByRole("button", { name: "Preview the example draft" }).click();
  await expect(
    page.getByText("Your request gives useful context.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Friday", exact: true }).click();
  await expect(page.getByText(/Friday conflicts with the brief/)).toBeVisible();
  await page
    .getByRole("button", { name: "Parking is free.", exact: true })
    .click();
  await expect(
    page.getByText(/we cannot conclude it is true or false/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Correct the day and remove unverified parking",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Checked invitation", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Involve a qualified health professional" })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByRole("textbox", { name: "AI can help people…", exact: true })
    .fill("Find patterns, but check important details.");
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Explain it in your own words",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "AI can help people…", exact: true }),
  ).toHaveValue("Find patterns, but check important details.");
  await page
    .getByRole("button", { name: "Watch & Listen", exact: true })
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
    .getByRole("button", { name: "Read & Explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Home: alarm and photos" }).click();
  await page
    .getByRole("button", { name: "Search the photos for “dog”" })
    .click();
  await expect(
    page.getByRole("button", { name: "Blue sky", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Club dog wearing a teal collar",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/This is the club’s dog with the teal collar/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Show a traffic update" }).click();
  await expect(
    page.getByRole("button", { name: "Inspect alternative: 35 minutes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Inspect fit information" }).click();
  await page.getByRole("button", { name: "Keep looking", exact: true }).click();
  await expect(
    page.getByText(/28 cm exceeds the bag’s maximum of 25 cm/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Spam", exact: true }).click();
  await page
    .getByRole("button", { name: "Verify through a known contact" })
    .click();
  await expect(
    page.getByText(/Maya uses contact details she already trusts/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page
    .getByRole("button", { name: "Find likely dog pictures", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Recognise", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("✓ Connected", { exact: true })).toHaveCount(1);
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
      page.getByRole("link", { name: "Open the separate knowledge check" }),
    ).toBeVisible();
    expect(await page.locator("section").count()).toBeGreaterThan(7);
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
    .getByRole("button", { name: "Read & Explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Automatic does not always mean AI" }),
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
    page.getByRole("heading", { name: "Automatic does not always mean AI" }),
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
    .getByRole("button", { name: "Read & Explore", exact: true })
    .click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  const id = await signIn(context);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Automatic does not always mean AI" }),
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
  await page.getByRole("button", { name: "Reload the saved place" }).click();
  await expect(
    page.getByRole("button", { name: "Watch & Listen", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(79);
  await page.getByLabel("Playback speed").selectOption("1.5");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.locator("video").evaluate((v: HTMLVideoElement) => v.playbackRate),
    )
    .toBe(1.5);
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
    .getByRole("button", { name: "Read & Explore", exact: true })
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
    page.getByRole("heading", { name: "Automatic does not always mean AI" }),
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
