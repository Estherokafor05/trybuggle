// The admin area in a real browser: first set-up, the authenticator app,
// signing in with a code, the course editor, invites, and keeping admins and
// learners apart. Run the app with AUTH_RATE_LIMIT=off and
// ADMIN_SETUP_KEY=browser-test-set-up-key-123.
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { base32 } from "@better-auth/utils/base32";
import { createOTP } from "@better-auth/utils/otp";

process.loadEnvFile(".env.local");
const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Admin fixtures must run against a local application.");
const SETUP_KEY = "browser-test-set-up-key-123";
const PASSWORD = "a-long-admin-password";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

test.afterAll(async () => {
  await sql`DELETE FROM admin_user`;
  await sql`DELETE FROM admin_setup`;
  await sql`DELETE FROM admin_invites`;
  await sql`DELETE FROM admin_audit`;
  await sql`UPDATE assessments SET pass_percent = 70, max_attempts = NULL, shuffle_options = false`;
  await sql.end();
});

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const axe = async (page: Page) => expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

test("admins are separate, set up with an authenticator app, and can change check settings and invite others", async ({ browser }) => {
  test.setTimeout(120_000);
  await sql`DELETE FROM admin_user`;
  await sql`DELETE FROM admin_setup`;
  await sql`DELETE FROM admin_invites`;

  // Signed out, or signed in as a learner: the admin area asks for an admin sign-in.
  const learner = await browser.newContext();
  const email = `qa-learner-${randomUUID()}@example.com`;
  const { user } = await (await learner.request.post(base + "/api/auth/sign-up/email", {
    headers: { Origin: base },
    data: { name: "Learner", email, password: PASSWORD },
  })).json();
  await sql`UPDATE auth_user SET "emailVerified" = true WHERE id = ${user.id}`;
  await learner.request.post(base + "/api/auth/sign-in/email", { headers: { Origin: base }, data: { email, password: PASSWORD } });
  const learnerPage = await learner.newPage();
  await learnerPage.goto(base + "/admin/course");
  await expect(learnerPage).toHaveURL(`${base}/admin/sign-in`);
  await learnerPage.getByLabel("Email").fill(email);
  await learnerPage.getByLabel("Password").fill(PASSWORD);
  await learnerPage.getByRole("button", { name: "Continue" }).click();
  await expect(learnerPage.getByText("That email and password don't match an admin account.")).toBeVisible();
  await learner.close();

  // First admin, on a phone.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const adminEmail = `qa-admin-${randomUUID()}@example.com`;
  await page.goto(base + "/admin/setup");
  await expect(page.getByRole("heading", { name: "Set up the first admin" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await axe(page);
  await page.getByLabel("Set-up key").fill("the-wrong-key-the-wrong-key");
  await page.getByLabel("Your name").fill("Ada Admin");
  await page.getByLabel("Your email").fill(adminEmail);
  await page.getByLabel("Choose a password").fill(PASSWORD);
  await page.getByLabel("Type the password again").fill(PASSWORD);
  await page.getByRole("button", { name: "Create the first admin" }).click();
  await expect(page.getByText("That set-up key isn't right.")).toBeVisible();
  await page.getByLabel("Set-up key").fill(SETUP_KEY);
  await page.getByLabel("Your name").fill("Ada Admin");
  await page.getByLabel("Your email").fill(adminEmail);
  await page.getByLabel("Choose a password").fill(PASSWORD);
  await page.getByLabel("Type the password again").fill(PASSWORD);
  await page.getByRole("button", { name: "Create the first admin" }).click();
  await expect(page.getByText(/Your admin account is ready/)).toBeVisible();

  // Signing in sends a new admin to set up their authenticator app first.
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(`${base}/admin/security`);
  await page.goto(base + "/admin/course");
  await expect(page).toHaveURL(`${base}/admin/security`, { timeout: 10_000 });
  await page.getByLabel("Your password").fill(PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("img", { name: "QR code for your authenticator app" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Backup codes" }).getByRole("listitem")).toHaveCount(10);
  const key = (await page.locator("span.font-mono").first().textContent())!.trim();
  const code = () => createOTP(base32.decode(key), { digits: 6, period: 30 }).totp();
  expect(await noOverflow(page)).toBe(true);
  await axe(page);
  await page.getByLabel("6-digit code").fill("000000");
  await page.getByRole("button", { name: "Turn it on" }).click();
  await expect(page.getByText(/That code didn't match/)).toBeVisible();
  await page.getByLabel("6-digit code").fill(await code());
  await page.getByRole("button", { name: "Turn it on" }).click();
  await expect(page.getByText("Your authenticator app is set up.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hello, Ada" })).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
  await axe(page);

  // Admin and learner cookies are separate.
  const cookies = await context.cookies(base);
  expect(cookies.some((c) => /^(__Secure-)?buggle-admin\.session_token$/.test(c.name))).toBe(true);
  expect(cookies.some((c) => /better-auth/.test(c.name))).toBe(false);

  // Course editor: change Lesson 1's pass mark and tries.
  await page.getByRole("navigation", { name: "Admin menu" }).getByRole("link", { name: "Course" }).click();
  await expect(page.getByRole("heading", { name: "AI Literacy", level: 1 })).toBeVisible();
  await page.locator("#check-what-counts-as-ai summary").click();
  const editor = page.locator("#check-what-counts-as-ai");
  await editor.getByLabel("Pass mark (%)").fill("0");
  await editor.getByRole("button", { name: /Save/ }).click();
  await expect(editor.getByLabel("Pass mark (%)")).toHaveJSProperty("validity.valid", false);
  await editor.getByLabel("Pass mark (%)").fill("80");
  await editor.getByLabel(/Tries allowed/).fill("3");
  await editor.getByRole("button", { name: /Save/ }).click();
  await expect(page.getByText(/Saved. The new settings apply/)).toBeVisible();
  const [row] = await sql`SELECT pass_percent, max_attempts FROM assessments WHERE legacy_key = 'what-counts-as-ai'`;
  expect([row.pass_percent, row.max_attempts]).toEqual([80, 3]);
  await expect(page.locator("#check-what-counts-as-ai summary")).toContainText("pass 80% · 3 tries");
  expect(await noOverflow(page)).toBe(true);
  await axe(page);

  // The forum moderation page opens.
  await page.goto(base + "/admin/forum");
  await expect(page.getByRole("heading", { name: "Forum", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Reports waiting/ })).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
  await axe(page);

  // Invite a second admin; the link works once.
  await page.goto(base + "/admin/team");
  const second = `qa-admin-${randomUUID()}@example.com`;
  await page.getByLabel("Their email").fill(second);
  await page.getByRole("button", { name: "Create invite" }).click();
  const link = await page.getByLabel("Invite link").inputValue();
  expect(link).toMatch(new RegExp(`^${base}/admin/invite/[A-Za-z0-9_-]{40,}$`));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Waiting to join" })).toBeVisible();
  await expect(page.getByRole("button", { name: `Cancel invite for ${second}` })).toBeVisible();
  await axe(page);
  const invited = await browser.newContext();
  const invitedPage = await invited.newPage();
  await invitedPage.goto(link);
  await expect(invitedPage.getByText(second)).toBeVisible();
  await invitedPage.getByLabel("Your name").fill("Bola Admin");
  await invitedPage.getByLabel("Choose a password").fill(PASSWORD);
  await invitedPage.getByLabel("Type the password again").fill(PASSWORD);
  await invitedPage.getByRole("button", { name: "Create my admin account" }).click();
  await expect(invitedPage.getByText(/Your admin account is ready/)).toBeVisible();
  await invitedPage.goto(link);
  await expect(invitedPage.getByRole("heading", { name: "This invite link doesn't work" })).toBeVisible();
  await invited.close();

  // The activity log records it all.
  await page.goto(base + "/admin/activity");
  for (const label of ["Changed check settings", "Invited an admin", "Joined the admin team", "Set up their authenticator app"])
    await expect(page.getByText(label).first()).toBeVisible();

  // Sign out, then sign in: password, then a code.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByText("You've signed out of the admin area.")).toBeVisible();
  await page.goto(base + "/admin");
  await expect(page).toHaveURL(`${base}/admin/sign-in`);
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(`${base}/admin/sign-in/code`);
  await axe(page);
  // Wait for a fresh 30-second window so the code isn't reused.
  await page.waitForTimeout(((30 - (Math.floor(Date.now() / 1000) % 30)) % 30) * 1000 + 1000);
  await page.getByLabel("6-digit code").fill(await code());
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Hello, Ada" })).toBeVisible();

  // Set-up is closed now that admins exist.
  await page.goto(base + "/admin/setup");
  await expect(page.getByRole("heading", { name: "Set-up is closed" })).toBeVisible();
  await context.close();
});
