"use client";
// The header's light/dark button and the Appearance choice in Settings.
import { useEffect, useState, useSyncExternalStore } from "react";
import { applyTheme, isDark, readTheme, THEME_CHANGED, type Theme } from "./theme";

function subscribe(callback: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", callback);
  window.addEventListener(THEME_CHANGED, callback);
  return () => {
    query.removeEventListener("change", callback);
    window.removeEventListener(THEME_CHANGED, callback);
  };
}
const useDark = () => useSyncExternalStore(subscribe, isDark, () => false);

/** Sun or moon: switches between light and dark. */
export function ThemeButton({ className = "" }: { className?: string }) {
  const dark = useDark();
  return (
    <button
      type="button"
      onClick={() => applyTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`inline-grid size-11 shrink-0 place-items-center rounded-full text-navy hover:bg-lavender ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {dark ? (
          <>
            <circle cx="10" cy="10" r="3.6" />
            <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.7 4.7 6 6M14 14l1.3 1.3M4.7 15.3 6 14M14 6l1.3-1.3" />
          </>
        ) : (
          <path d="M16 12.3A6.5 6.5 0 0 1 7.7 4a6.5 6.5 0 1 0 8.3 8.3Z" />
        )}
      </svg>
    </button>
  );
}

const CHOICES: { value: Theme; label: string; hint: string; emoji: string }[] = [
  { value: "system", label: "Same as my device", hint: "Light or dark, following your phone or computer", emoji: "🖥️" },
  { value: "light", label: "Light", hint: "Always light", emoji: "☀️" },
  { value: "dark", label: "Dark", hint: "Always dark: easier on the eyes at night", emoji: "🌙" },
];

/** Settings: system, light or dark. Saved straight away, on this device. */
export function ThemeChoice() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    // Read the saved choice once the page is in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readTheme());
  }, []);
  return (
    <fieldset>
      <legend className="sr-only">Appearance</legend>
      <ul className="grid gap-2 sm:grid-cols-3">
        {CHOICES.map((c) => (
          <li key={c.value}>
            <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 border-line bg-white px-4 py-3 has-[:checked]:border-brand-deep has-[:checked]:bg-lavender">
              <input
                type="radio"
                name="theme"
                value={c.value}
                checked={theme === c.value}
                onChange={() => {
                  setTheme(c.value);
                  applyTheme(c.value);
                }}
                className="mt-1 size-5 shrink-0 accent-brand"
              />
              <span>
                <span className="block font-semibold text-ink">
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </span>
                <span className="block text-sm text-muted">{c.hint}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-muted">
        Saved on this device.
      </p>
    </fieldset>
  );
}
