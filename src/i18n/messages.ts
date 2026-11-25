// Words in the site's menus, one set per language. Every language must have
// every key; TypeScript checks this.
import type { Locale } from "./locales";

const en = {
  "nav.home": "Home",
  "nav.welcome": "Welcome",
  "nav.module1": "Module 1",
  "nav.modules": "All modules",
  "nav.forum": "Forum",
  "nav.dashboard": "Dashboard",
  "nav.account": "Your account",
  "nav.logIn": "Log in",
  "nav.signUp": "Sign up",
  "nav.menu": "Menu",
  "nav.main": "Main navigation",
  "nav.signedInAs": "Signed in as",
  "footer.tagline": "Understand AI. Learn how to use it.",
  "footer.modules": "All modules",
  "footer.howItWorks": "How it works",
  "footer.verify": "Check a certificate",
  "footer.privacy": "Privacy",
  "footer.nav": "Footer navigation",
};

export type MessageKey = keyof typeof en;
export const messages: Record<Locale, Record<MessageKey, string>> = { en };
