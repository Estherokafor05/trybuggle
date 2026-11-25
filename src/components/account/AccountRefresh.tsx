"use client";
// Tells the site header when the learner's name or photo changes in Settings,
// so it updates without leaving the page.
import { useEffect } from "react";

export const ACCOUNT_CHANGED = "buggle:account-changed";

export function AccountRefresh({ name, image }: { name: string; image: string | null }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(ACCOUNT_CHANGED, { detail: { name, image } }));
  }, [name, image]);
  return null;
}
