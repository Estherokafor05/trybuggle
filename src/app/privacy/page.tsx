import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy policy | Buggle Learn",
  description: "What Buggle Learn collects, why, who it is shared with, and your choices.",
};

// DRAFT: fill these in before this page goes live.
const OPERATOR = "[Name of the person or organisation that runs Buggle Learn]";
const CONTACT_EMAIL = "[contact email]";
const COUNTRY = "[country]";
const MINIMUM_AGE = "[minimum age]";
const LAST_UPDATED = "[date]";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-9">
      <h2 id={id} className="text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <header className="rounded-[2rem] bg-hero-lavender p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-navy">Privacy</p>
          <h1 className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Privacy policy</h1>
          <p className="mt-3 leading-relaxed text-ink sm:text-lg">
            Buggle Learn is free. We collect as little as we can, we never sell your information,
            and we do not use advertising or tracking cookies.
          </p>
          <p className="mt-3 text-sm text-navy">Last updated: {LAST_UPDATED}</p>
        </header>

        <section aria-labelledby="summary" className="mt-6 rounded-3xl bg-mint/60 p-5 sm:p-6">
          <h2 id="summary" className="text-lg font-bold text-navy">The short version</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
            <li>You can learn without an account. We then keep your quiz results under a random code, not your name.</li>
            <li>If you sign in with Google, we keep a Google account number so we can save your progress across devices. We do not keep your email address in our database.</li>
            <li>Notes you write in “Your turn” stay on your device. They are never sent to us.</li>
            <li>The example chats in lessons are scripted. Nothing you do in them is sent to any AI tool.</li>
            <li>You can ask us to see or delete your information at any time.</li>
          </ul>
        </section>

        <Section id="who" title="Who we are">
          <p>
            Buggle Learn is run by {OPERATOR}, based in {COUNTRY}. If you have any question about
            your information, email <span className="font-semibold">{CONTACT_EMAIL}</span>.
          </p>
        </Section>

        <Section id="collect" title="What we collect">
          <h3 className="pt-1 font-bold text-navy">If you learn without an account</h3>
          <p>
            We set one cookie, <code className="rounded bg-canvas px-1.5">buggle_guest</code>, that
            holds a random code. It lets us keep your knowledge check and final assessment results,
            and where you got to in a lesson, for this browser. It does not contain your name or
            any other personal details, and it expires after a year.
          </p>
          <h3 className="pt-1 font-bold text-navy">If you sign in with Google</h3>
          <p>
            Google tells us your name, email address and profile picture. We use these only to
            show that you are signed in. They are kept in an encrypted sign-in cookie in your
            browser, not in our database.
          </p>
          <p>
            Our database keeps the account number Google gives us, so we can recognise you on any
            device. When you sign in, any results you earned as a guest on that browser move into
            your account.
          </p>
          <h3 className="pt-1 font-bold text-navy">Your learning records</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>The answers you submit to knowledge checks and final assessments, your scores and when you took them.</li>
            <li>Where you got to in a lesson, so you can carry on later.</li>
            <li>For certificates: the name you choose to show on it, its code and the date.</li>
          </ul>
          <h3 className="pt-1 font-bold text-navy">On your device only</h3>
          <p>
            Your “Your turn” notes, and your place in a lesson before you sign in, are saved in
            your browser’s storage. We cannot see them. Clearing your browser data removes them.
          </p>
          <h3 className="pt-1 font-bold text-navy">What we do not collect</h3>
          <p>
            No payment details (Buggle Learn is free), no advertising or tracking cookies, and no
            analytics that follow you around the web.
          </p>
        </Section>

        <Section id="why" title="Why we use it">
          <p>
            Only to run the course you have chosen to take: to save your progress, mark your
            knowledge checks and assessments, and create the certificates you ask for. We do not
            use your information for advertising, and we do not sell it.
          </p>
        </Section>

        <Section id="share" title="Who we share it with">
          <p>We use a small number of service providers to run Buggle Learn:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Vercel</b> hosts the website. The servers that handle your requests are in London, United Kingdom.</li>
            <li><b>Neon</b> runs our database, which is stored in London, United Kingdom.</li>
            <li><b>Google</b> handles sign-in, if you choose to sign in with Google.</li>
          </ul>
          <p>
            They process your information only to provide their service to us. Our website
            servers and database are both in the United Kingdom. Vercel and Neon are United States
            companies, and Google may process sign-in information in other countries.
          </p>
        </Section>

        <Section id="keep" title="How long we keep it">
          <ul className="list-disc space-y-1 pl-5">
            <li>The guest cookie expires after one year.</li>
            <li>The sign-in cookie expires 30 days after your last visit, or when you sign out.</li>
            <li>Your learning records and certificates are kept until you ask us to delete them.</li>
          </ul>
        </Section>

        <Section id="rights" title="Your choices and rights">
          <p>
            You can ask us for a copy of your information, ask us to correct it, or ask us to
            delete it, by emailing <span className="font-semibold">{CONTACT_EMAIL}</span>. You can
            change the name on a certificate yourself on its certificate page. Depending on where
            you live, you may also have the right to complain to your data protection authority.
          </p>
        </Section>

        <Section id="children" title="Children">
          <p>
            Buggle Learn is for people aged {MINIMUM_AGE} and over. If you think a younger child
            has given us information, please contact us and we will delete it.
          </p>
        </Section>

        <Section id="changes" title="Changes to this policy">
          <p>
            If we change how we use your information, we will update this page and the date at
            the top.
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
