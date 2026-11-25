"use client";
// Picks the learner's chosen language in the browser, so pages can stay fast
// and cached. Pages first show English, then switch if another language is set.
import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locales";
import { messages, type MessageKey } from "./messages";

function readLocale(): Locale {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : "";
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    () => () => {},
    readLocale,
    () => DEFAULT_LOCALE,
  );
}

export function useT() {
  const locale = useLocale();
  return (key: MessageKey) => messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
}

/** Keeps <html lang> in step with the chosen language, for screen readers. */
export function HtmlLang() {
  const locale = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
