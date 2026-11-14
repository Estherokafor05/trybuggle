import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy policy | Buggle Learn",
  description: "What Buggle Learn collects while it is in beta, why, who it is shared with, and your choices.",
};

// DRAFT: fill these in before this page goes live.
const PRIVACY_EMAIL = "[privacy email address]";
const GUEST_RETENTION = "[number] months";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-9">
      <h2 id={id} className="text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink">{children}</div>
    </section>
  );
}
function H3({ children }: { children: ReactNode }) {
  return <h3 className="pt-1 font-bold text-navy">{children}</h3>;
}
function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
}
const email = <span className="font-semibold">{PRIVACY_EMAIL}</span>;

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
          <p className="mt-3 text-sm text-navy">Last updated: 14 November 2026</p>
        </header>

        <Section id="who" title="Who we are">
          <p>
            Buggle Learn is operated by Bugle Solutions, Inc., a Delaware corporation, 2261 Market
            Street, San Francisco, CA 94104, United States.
          </p>
          <p>For any privacy question or request, email {email}.</p>
        </Section>

        <Section id="collect" title="What we collect">
          <H3>If you use Buggle Learn without an account</H3>
          <List>
            <li>
              An anonymous ID stored in a cookie on your device. It holds no personal details. We
              use it to record your knowledge check and assessment results, so they count when
              you sign up.
            </li>
          </List>
          <H3>If you create an account</H3>
          <List>
            <li>
              Your name, email address and profile picture, which Google shares with us when you
              sign in with Google. We use your name and email address only to show that you are
              signed in. They are kept in an encrypted sign-in cookie in your browser, not in our
              database.
            </li>
            <li>An account number from Google, so we can recognise you on any device.</li>
            <li>
              Your progress: where you are in each lesson, your knowledge check and assessment
              answers and results, and any certificates you earn.
            </li>
            <li>The name you choose to show on your certificate.</li>
          </List>
          <H3>What stays on your device</H3>
          <List>
            <li>
              Notes you write in the “Your turn” activities. These are kept in your browser and
              are never sent to us.
            </li>
            <li>If you have not signed in, your place in a lesson is also kept only in your browser.</li>
          </List>
        </Section>

        <Section id="not" title="What we do not collect">
          <List>
            <li>We do not ask for payment details. Buggle Learn is free.</li>
            <li>We do not show adverts or use advertising trackers, and we do not use analytics tools.</li>
            <li>No AI tool runs inside Buggle Learn, so nothing you type is sent to an AI company.</li>
          </List>
        </Section>

        <Section id="why" title="Why we use your information">
          <List>
            <li>To save your progress and let you continue on another device.</li>
            <li>To mark your knowledge checks fairly and issue your certificate.</li>
          </List>
          <p>We do not sell your information, and we do not use it for advertising.</p>
        </Section>

        <Section id="share" title="Who we share it with">
          <p>We share information only with the service providers that run Buggle Learn for us:</p>
          <List>
            <li>Google, for sign-in.</li>
            <li>Vercel, which hosts the website.</li>
            <li>Neon, which stores accounts and progress.</li>
          </List>
          <p>
            Our website and database run on servers in the United Kingdom. Our service providers
            may also process your information in the United States or other countries. We may
            also disclose information if the law requires it.
          </p>
        </Section>

        <Section id="cookies" title="Cookies">
          <p>
            We use only the cookies needed to run the site: the cookies that keep you signed in
            securely, and one anonymous ID for learners without an account. Signing out removes
            the anonymous ID from that device.
          </p>
        </Section>

        <Section id="keep" title="How long we keep it">
          <p>
            We keep your account information for as long as you have an account. If you ask us to
            delete your account, we delete your personal information within 30 days. Anonymous
            results that are never linked to an account are deleted after {GUEST_RETENTION}.
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
            Email {email} and we will reply within 30 days. Depending on where you live, you may
            have further rights under your local privacy law, including the right to complain to
            your data protection regulator.
          </p>
        </Section>

        <Section id="age" title="Age">
          <p>
            Buggle Learn is for people aged 16 and over. We do not knowingly collect information
            from anyone younger. If you believe a younger person has created an account, email us
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
