// Languages learners can choose in Settings. To add one: add it here, add its
// messages in messages.ts, and it appears in Settings straight away.
// Lessons stay in English until each one is translated.
export const LOCALES = [{ code: "en", name: "English", native: "English" }] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "buggle_lang";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && LOCALES.some((l) => l.code === value);
