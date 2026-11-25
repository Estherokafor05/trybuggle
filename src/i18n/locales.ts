// Languages learners can choose in Settings. To add one: add it here, add its
// messages in messages.ts, and it appears in Settings straight away.
// Lessons stay in English until each one is translated.
export const LOCALES = [{ code: "en", name: "English", native: "English" }] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "buggle_lang";

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && LOCALES.some((l) => l.code === value);

/** Languages we're working on. Settings shows them greyed out until they're ready. */
export const UPCOMING_LOCALES = [
  { code: "fr", name: "French", native: "Français" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "ha", name: "Hausa", native: "Hausa" },
  { code: "yo", name: "Yoruba", native: "Yorùbá" },
  { code: "ig", name: "Igbo", native: "Igbo" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "zh", name: "Chinese", native: "中文" },
] as const;
