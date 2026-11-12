import type { Metadata } from "next";
import { JourneyProgress } from "@/components/JourneyProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WelcomeIntro } from "@/components/welcome/WelcomeIntro";
import { welcome } from "@/content/welcome";

export const metadata: Metadata = {
  title: "Welcome | Buggle Learn",
  description:
    "A short narrated welcome to Buggle Learn: AI in plain language, with no technical experience needed.",
};

export default function WelcomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1232px] px-4 pb-12 pt-6 sm:px-7 sm:pb-16 sm:pt-8">
        <WelcomeIntro />
        <div className="mt-5">
          <JourneyProgress current="welcome" />
        </div>
        <details className="mt-5 rounded-2xl border border-line bg-white p-5">
          <summary className="cursor-pointer py-2 font-semibold">
            Read the whole welcome
          </summary>
          <div className="mt-3 space-y-3 leading-relaxed">
            {welcome.scenes.map((scene) => (
              <p key={scene.id}>
                {welcome.cues
                  .filter((c) => c.start >= scene.start && c.start < scene.end)
                  .map((c) => c.text)
                  .join(" ")}
              </p>
            ))}
          </div>
        </details>
      </main>
      <SiteFooter />
    </>
  );
}
