import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { GUEST_RETENTION_MONTHS } from "@/server/accounts";
import { AnalyticsChoiceControl } from "@/components/AnalyticsConsent";

export const metadata: Metadata = {
  title: "Privacy policy | Buggle Learn",
  description: "What Buggle Learn collects while it is in beta, why, who it is shared with, and your choices.",
};

const PRIVACY_EMAIL = "buggle.privacy@proton.me";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-9">
      <h2 id={id} className="text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink">{children}</div>
    </section>
  );
}
function H3({ id, children }: { id?: string; children: ReactNode }) {
  return <h3 id={id} className="scroll-mt-24 pt-1 font-bold text-navy">{children}</h3>;
}
function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}
const email = PRIVACY_EMAIL ? (
  <a href={`mailto:${PRIVACY_EMAIL}`} className="font-semibold underline">{PRIVACY_EMAIL}</a>
) : (
  <span className="font-semibold">our privacy email address (coming soon)</span>
);

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Beta version</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Privacy policy</h1>
          <p className="mt-3 leading-relaxed text-ink sm:text-lg">
            Buggle Learn is in beta testing. This policy explains what information we collect
            while you use it and what we do with it. We collect as little as we can.
          </p>
          <p className="mt-3 text-sm text-navy">Last updated: 25 November 2026</p>
        </header>

        <Section id="who" title="Who we are">
          <p>
            Buggle Learn is operated by Bugle Solutions, Inc., a Delaware corporation, 2261 Market
            Street, San Francisco, CA 94104, United States.
          </p>
          <p>
            For any privacy question or request, email {email}. You can delete your account
            yourself at any time from{" "}
            <Link href="/account" className="font-semibold text-navy underline underline-offset-4">your account page</Link>.
          </p>
        </Section>

        <Section id="collect" title="What we collect">
          <H3>When you create an account</H3>
          <List>
            <li>
              Your name and email address. You give us these when you sign up, or Google shares
              them, with your profile picture, if you use Google. We use them to run your account,
              show your name on certificates, and send emails you need, such as confirming your
              email address or resetting your password.
            </li>
            <li>
              Your password, if you choose one. We store it only in scrambled (hashed) form, so
              nobody, including us, can read it.
            </li>
            <li>
              If you link Google, an account number from Google, so you can log in with Google.
            </li>
            <li>
              For each device you are logged in on: a session record with the date, your IP address
              and your browser type. We use these to keep you logged in, to let you log out, and
              to protect accounts from repeated guessing.
            </li>
            <li>
              Your progress: where you are in each lesson, your knowledge check and assessment
              answers and results, and any certificates you earn.
            </li>
            <li>The name you choose to show on your certificate.</li>
          </List>
          <H3>If you used Buggle Learn before accounts were needed</H3>
          <List>
            <li>
              An anonymous ID stored in a cookie on your device, with no personal details, linked
              to the knowledge check and assessment results you earned. They move into your
              account when you sign up or log in on that device.
            </li>
          </List>
          <H3 id="waitlist">If you join an early-access list</H3>
          <List>
            <li>
              Your email address and the role you pick, such as &ldquo;Manual tester, no code&rdquo;.
              We use them only to email you once when that course opens. Joining a list does not
              create an account.
            </li>
            <li>
              If you join the list for personal AI setup help, we keep your email address and the
              situation you chose (job, business or home), only to email you when that service opens.
            </li>
          </List>
          <H3>What stays on your device</H3>
          <List>
            <li>
              Notes you write in the “Your turn” activities. These are kept in your browser and
              are never sent to us.
            </li>
          </List>
        </Section>

        <Section id="not" title="What we do not collect">
          <List>
            <li>We do not ask for payment details. Buggle Learn&apos;s courses are free.</li>
            <li>We do not show adverts or use advertising trackers. We only collect usage data if you agree (see “Usage data” below).</li>
            <li>No AI tool runs inside Buggle Learn, so nothing you type is sent to an AI company.</li>
          </List>
        </Section>

        <Section id="why" title="Why we use your information">
          <List>
            <li>To save your progress and let you continue on another device.</li>
            <li>To mark your knowledge checks fairly and issue your certificate.</li>
            <li>If you join an early-access list, to email you when that course opens.</li>
          </List>
          <p>We do not sell your information, and we do not use it for advertising.</p>
          <p>
            If you join an organisation, such as your employer or school, its managers can see your
            name, email, progress, results and certificates. You can leave an organisation at any
            time. When an organisation pays for a plan, the payment is handled by Stripe; we never
            see or store card details.
          </p>
          <p>
            Forum posts are public. They show your first name and the first letter of your last
            name, never your email. You can edit or delete your own posts at any time. If you
            delete your account, your name and words are removed from the forum, and other
            people&apos;s replies stay.
          </p>
          <p>
            Each certificate has an ID and a public check page. Anyone with the ID can see the name
            on the certificate, what it was for, when it was completed and the ID. They never see
            your email or anything else about you. You choose who to share the ID with, and
            deleting your account removes the check page.
          </p>
        </Section>

        <Section id="analytics" title="Usage data">
          <p>
            We use a service called PostHog to understand how Buggle Learn is used. For everyone,
            we count which pages are visited and any errors the site shows, anonymously. This does
            not use cookies or store anything in your browser, and it does not identify you:
            PostHog counts visits using a code that changes every day and cannot be traced back to
            you.
          </p>
          <p>
            While Buggle Learn is in testing, we also ask whether you are happy to share more. If
            you agree, we also see what you click and where you get stuck, linked across your
            visits, including recordings of your visit so we can see where the site is confusing.
          </p>
          <p>
            Anything you type, such as notes, answers in text boxes and names, is hidden in these
            recordings, and so is your name and email address on your account page. We use this
            only to improve Buggle Learn. If you say no, only the anonymous counts above are
            collected.
          </p>
          <p>You can change your choice at any time:</p>
          <AnalyticsChoiceControl />
        </Section>

        <Section id="share" title="Who we share it with">
          <p>We share information only with the service providers that run Buggle Learn for us:</p>
          <List>
            <li>Google, if you choose to log in with Google, and to keep our early-access list in a Google Sheet.</li>
            <li>Resend, which sends account emails such as email confirmation and password reset.</li>
            <li>Vercel, which hosts the website.</li>
            <li>Neon, which stores accounts, progress and early-access sign-ups.</li>
            <li>PostHog, for anonymous visit counts and error reports, and fuller usage data only if you agree. It stores this data in the European Union.</li>
          </List>
          <p>
            Our website and database run on servers in the United Kingdom. Our service providers
            may also process your information in the United States or other countries. We may
            also disclose information if the law requires it.
          </p>
        </Section>

        <Section id="cookies" title="Cookies">
          <p>
            We use only the cookies needed to run the site: the cookies that keep you logged in
            securely, and, on devices used before accounts were needed, one anonymous ID. Logging
            in or out removes the anonymous ID from that device. If you agree to share usage data, PostHog also
            stores an ID in your browser to link your visits together.
          </p>
        </Section>

        <Section id="keep" title="How long we keep it">
          <p>
            We keep your account information for as long as you have an account. You can delete
            your account yourself on your account page, and everything linked to it is deleted
            straight away. If you ask us to delete it instead, we will do so within 30 days.
            Anonymous results that are never linked to an account are deleted automatically
            after {GUEST_RETENTION_MONTHS} months without any activity. Usage data and recordings
            are kept by PostHog for no longer than 12 months. Early-access sign-ups are deleted
            within 12 months of the course opening, or sooner if you ask.
          </p>
        </Section>

        <Section id="choices" title="Your choices">
          <p>You can ask us at any time to:</p>
          <List>
            <li>send you a copy of the information we hold about you,</li>
            <li>correct it, or</li>
            <li>delete your account and the information linked to it.</li>
          </List>
          <p>
            You can also delete your account yourself, straight away, from{" "}
            <Link href="/account" className="font-semibold text-navy underline underline-offset-4">your account page</Link>.
          </p>
          <p>
            Email {email} and we will reply within 30 days. Depending on where you live, you may
            have further rights under your local privacy law, including the right to complain to
            your data protection regulator.
          </p>
        </Section>

        <Section id="age" title="Age">
          <p>
            Buggle Learn is for people aged 15 and over. We ask you to confirm you are 15 or over
            when you create an account, and we do not knowingly collect information from anyone
            younger. If you believe a younger person has created an account, email us
            and we will delete it.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            This is a beta policy and it will change as Buggle Learn grows. We will update the
            date at the top and show a notice on the site about any important change.
          </p>
        </Section>

        <p className="mt-10">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-navy underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
