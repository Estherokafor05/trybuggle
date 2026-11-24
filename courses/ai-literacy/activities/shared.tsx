"use client";
// The platform's learning blocks with this course's defaults: Maya tells the
// stories, and reflections offer this course's sample answers.
import type { ReactNode } from "react";
import {
  Reflection as BaseReflection,
  Story as BaseStory,
} from "@/components/blocks/Blocks";
import { reflectionExample } from "../content/reflection-examples";

export {
  Choice,
  Feedback,
  Idea,
  Instruction,
  Typewriter,
  activityButton,
  answer,
  correctAnswer,
  primaryButton,
  usePhases,
  useReducedMotion,
  withAnswer,
  type Change,
  type Option,
  type Props,
} from "@/components/blocks/Blocks";

export function MayaFace() {
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#d8f4ec" />
      <path d="M8 40q0-12 12-12t12 12z" fill="#17867b" />
      <circle cx="20" cy="17" r="8" fill="#8d5a3b" />
      <path
        d="M11 17q-1-11 9-11t9 11q-2-6-9-6t-9 6z"
        fill="#21160f"
      />
      <circle cx="17" cy="17" r="1" fill="#17243c" />
      <circle cx="23" cy="17" r="1" fill="#17243c" />
      <path d="M17.5 20.5q2.5 2 5 0" stroke="#17243c" fill="none" />
    </svg>
  );
}

export function Story({
  children,
  who = "Maya",
  face = <MayaFace />,
}: {
  children: ReactNode;
  who?: string;
  face?: ReactNode;
}) {
  return (
    <BaseStory who={who} face={face}>
      {children}
    </BaseStory>
  );
}

export function Reflection(props: { prompts: string[]; slug: string; scope: string }) {
  return <BaseReflection {...props} example={reflectionExample(props.slug)} />;
}
