// How people's names show in small spaces: "Esther O." and "EO".
const parts = (name: string) => name.normalize("NFC").trim().split(/\s+/).filter(Boolean);

/** First name and the first letter of the last name: "Esther Okafor" → "Esther O." */
export function shortName(name: string | null | undefined) {
  const p = parts(name ?? "");
  if (!p.length) return "";
  if (p.length === 1) return p[0];
  return `${p[0]} ${Array.from(p[p.length - 1])[0].toUpperCase()}.`;
}

/** Up to two letters for a photo placeholder: "Esther Okafor" → "EO". */
export function initials(name: string | null | undefined) {
  const p = parts(name ?? "");
  if (!p.length) return "?";
  const first = Array.from(p[0])[0];
  const last = p.length > 1 ? Array.from(p[p.length - 1])[0] : "";
  return (first + last).toUpperCase();
}

const TONES = ["bg-hero-lavender", "bg-peach", "bg-mint", "bg-blush"];
/** The same soft colour for the same name, every time. */
export function toneFor(name: string | null | undefined) {
  let h = 0;
  for (const c of name ?? "") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}
