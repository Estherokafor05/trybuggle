# Buggle Learn

AI literacy for people with no technical background, across everyday life and work.

## First version

This release is a learning preview with a curriculum, module overview, two preview lessons, Google sign-in, separate written guides, and an illustrated first lesson with manual slide controls and recorded narration.

Assessments, saved learning progress, certificates and payments are not implemented. Both preview lessons have six-scene visual walkthroughs, recorded narration, manual navigation, captions, descriptive transcripts and independent guides. Reference slide decks remain local source material and are not part of the deployment.

## Run and check

Use Node.js 24 or later.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

## Google sign-in

Copy the empty settings from `.env.example` into `.env.local` and configure your Google OAuth client. Never commit credentials.

Local redirect URI: `http://localhost:3000/api/auth/callback/google`.

For Vercel, configure `AUTH_SECRET`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` as sensitive production environment variables. Set `AUTH_URL` to the stable production origin and add that origin followed by `/api/auth/callback/google` to the Google client's authorized redirect URIs. Preview deployments should not receive production secrets.

## Release and recovery

Run all checks above before deployment. Deploy the reviewed main branch to Vercel and verify the home page, both preview lessons, sign-in, illustrations and narration assets. The first release has no database migrations. If a later deployment fails, promote the previously verified deployment in Vercel. Review function logs for failures without logging credentials or learner data.

Lesson content lives in `src/content/`. Visual lesson components live in `src/components/walkthrough/`; bundled illustrations and audio live in `public/`.

Approved narration scripts and visual cues are maintained in `scripts/narration-scripts.json`. Bundled recordings use the local Kokoro-82M British English voice `bf_emma`; no speech API or runtime key is required. The timestamps in the lesson content files are measured from the rendered audio.

After approved changes are merged to main, Vercel automatically deploys production at https://trybuggle.vercel.app. Verify the deployment before reporting it ready.


### Animated story production

Lesson 2 includes an approved single-scene preview, **Getting to the centre** (57 seconds), alongside its existing full walkthrough and independent guide. Maya's original layered SVG character and the route/traffic assets are reusable components in `animation/src`. The original generated hallway illustration is bundled in `public/lessons/maya-journey/hallway.png`. The illustration deliberately replaces mixed reference imagery with a consistent original environment. Its production prompt and provenance are recorded in `animation/assets.json`.

The isolated animation workspace uses pinned Remotion packages. The user confirmed individual/team-of-up-to-three eligibility on 10 November 2026; review Remotion licensing if that changes. No rendering service or runtime animation package is added to the learning application. Install with `npm ci --prefix animation`, validate with `npm --prefix animation run typecheck`, and render desktop/mobile video and stills with `npm --prefix animation run render`. Rendering runs before deployment, not inside Vercel requests. The app uses the versioned output files already in `public`.

Narration was produced locally using Kokoro-82M's `bf_emma` voice. `narration.json` records the script and measured spoken intervals; `captions.vtt` follows those timings. Timed character and diagram actions are authored at 30 fps against the same recording. Any new recording requires rechecking timing before rendering. Keyframes supply a reduced-motion option with the same recording and a descriptive transcript.

The traffic exercise uses explicitly fictional 15/30-minute estimates for the usual road and 20 minutes for the alternative. It demonstrates how changing conditions can affect a prediction, not the actual internal calculation of Google Maps. Educational source: https://deepmind.google/blog/traffic-prediction-with-advanced-graph-neural-networks/ . The scene makes no claim that all navigation software uses AI. Tests cover these values, chapter boundaries, caption timing and deliverable completeness. Visual quality and beginner comprehension require review of the rendered story, beyond automated tests.
