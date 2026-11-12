import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WelcomeIntro } from "@/components/welcome/WelcomeIntro";
import { welcomeScenes } from "@/content/welcome";

export const metadata: Metadata = {
  title: "Welcome | Buggle Learn",
  description:
    "A short welcome to Buggle Learn: AI in plain language, with no technical experience needed.",
};

export default function WelcomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1232px] px-4 pb-12 pt-6 sm:px-7 sm:pb-16 sm:pt-8">
        <WelcomeIntro />
        <details className="mt-5 rounded-2xl border border-line bg-white p-5">
          <summary className="cursor-pointer py-2 font-semibold">
            Read the whole welcome
          </summary>
          <div className="mt-3 space-y-3 leading-relaxed">
            {welcomeScenes.map((scene) => (
              <p key={scene.id}>{scene.text}</p>
            ))}
          </div>
        </details>
      </main>
      <SiteFooter />
    </>
  );
}
