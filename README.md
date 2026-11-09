# Buggle Learn

AI education for people who test software.

The premise: you don't need to write Python to understand AI or to build agents
for your own workflows. The course teaches foundations first, then building, and
keeps two things firmly apart that people usually blur together:

- **Using AI to test deterministic software.** The app behaves the same way
  every time; AI makes you faster at testing it.
- **Testing AI-native products.** Output varies run to run, so you grade it
  against an eval set instead of asserting equality.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit
```

## Layout

```
src/
  app/
    page.tsx                  landing page
    curriculum/page.tsx       all modules, grouped by track
    modules/[slug]/page.tsx   one module and its lesson outline
    api/waitlist/route.ts     signup endpoint — not storing anything yet
    globals.css               brand tokens live here
  components/
    diagrams/                 the SVG diagrams, reusable inside lessons
  content/
    modules.ts                the curriculum, as typed data
```

## Adding or changing a module

Everything about the curriculum lives in `src/content/modules.ts`. Edit that
file and the landing page, the curriculum page and the module pages all update.
No CMS, no database — that stays true until lesson bodies need one.

Each module has a `status` of `open`, `next` or `planned`, which drives the
badge shown on the card.

## Brand colours

Two values in `src/app/globals.css`:

- `--color-brand: #005c32` — the primary. Buttons, links, the logo mark.
- `--color-gold: #d3af5e` — the accent. Module numbers, track tags, section
  rules only.

Gold doesn't have enough contrast against white for body text or button fills,
so it's deliberately kept off both. Change those two hex values and the whole
site follows.

## What isn't built yet

- **Waitlist storage.** `src/app/api/waitlist/route.ts` validates the signup and
  returns `stored: false`. The form reads that and tells the visitor the truth
  rather than pretending. Replace the marked block with a real write when you've
  picked a store.
- **Accounts and progress tracking.** Not needed until there are lessons to
  track progress through.
- **Lesson bodies.** The outlines are in `modules.ts`; the prose isn't written.
