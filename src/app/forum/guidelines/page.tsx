import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Community guidelines | Buggle Learn" };

const rules = [
  ["Be kind", "Everyone here is learning, and every question is welcome. Disagree with ideas, never with people."],
  ["Keep personal details private", "Don't post phone numbers, addresses, passwords or anything that identifies you or someone else. There are no private messages, so never ask anyone to contact you elsewhere."],
  ["Stay on topic", "Talk about AI, your lessons and how you use AI. No advertising or selling."],
  ["Be careful with advice", "Share what worked for you, and say when you're not sure. For health, legal or money questions, talk to a qualified person."],
  ["Help keep it safe", "If something breaks these guidelines, use Report. Our team reads every report and can hide posts or close conversations."],
];

export default function GuidelinesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-4 pb-12 pt-3 sm:px-6 sm:pt-8">
        <Link href="/forum" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy underline-offset-4 hover:underline">
          <span aria-hidden="true">←</span> Forum
        </Link>
        <header className="mt-2 rounded-[2rem] bg-mint p-6 sm:p-9">
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08]">Community guidelines</h1>
          <p className="mt-3 leading-relaxed text-ink">
            The forum is for learners aged 15 and over. These guidelines keep it friendly, useful and safe.
          </p>
        </header>
        <ol className="mt-6 grid gap-3">
          {rules.map(([title, body], i) => (
            <li key={title} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-line/70 bg-white p-4">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-lavender font-display text-sm font-bold text-navy">
                {i + 1}
              </span>
              <span>
                <span className="block font-bold">{title}</span>
                <span className="mt-0.5 block leading-relaxed text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Posts that break these guidelines may be hidden. Your posts show your first name and the first letter of your
          last name. If you delete your account, your name and words are removed from the forum.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
