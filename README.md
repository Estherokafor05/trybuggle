# Buggle Learn

AI literacy for people with no technical background, across everyday life and work.

## First version

This release is a learning preview with a curriculum, module overview, two preview lessons, Google sign-in, separate written guides, a narrated illustrated film for Lesson 2, and a narrated illustrated walkthrough for Lesson 1.

Assessments, saved learning progress, certificates and payments are not implemented. Lesson 2 has one continuous six-part film with embedded spoken narration, captions and a descriptive transcript. Lesson 1 retains its earlier visual walkthrough. Both lessons have independent written guides. Reference slide decks remain local source material and are not part of the deployment.

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

Lesson content lives in `src/content/`. Visual lesson components live in `src/components/`; bundled illustrations and audio live in `public/`.

Lesson 1 narration scripts and visual cues are maintained in `scripts/narration-scripts.json`. Lesson 2 uses `animation/day-script.json` and measured cue times in `public/lessons/maya-day/narration.json`. Bundled recordings use the local Kokoro-82M British English voice `bf_emma`; no speech API or runtime key is required.

After approved changes are merged to main, Vercel automatically deploys production at https://trybuggle.vercel.app. Verify the deployment before reporting it ready.


### Illustrated story production

Lesson 2 now has one 139-second narrated film, **A day with Maya**, and an independent written guide. The film follows Maya, a community-centre administrator preparing an evening photography club, through an alarm, photo search, journey estimate, shop suggestion and misplaced booking message. Its scenes are authored in `animation/day-script.json`. The old slide walkthrough and self-paced still-image mode for this lesson were removed.

The isolated Remotion workspace uses the original layered Maya character, route animation and new fictional photo, shopping and inbox illustrations. The two original generated backgrounds are bundled in `public/lessons/maya-day/`. Their provenance is recorded in `animation/assets.json`. Run `npm ci --prefix animation`, `npm --prefix animation run typecheck`, then `npm --prefix animation run render` to produce desktop and phone MP4s and poster images. The application serves the versioned results; it does not render video on demand. Remotion licence eligibility for an individual or team of up to three was confirmed by the user.

The spoken script was recorded locally with Kokoro-82M's British English `bf_emma` voice. The film embeds that narration. Measured cue timings in `narration.json` produce `captions.vtt` and the on-page captions. A descriptive transcript and the independent written guide provide text access. No browser speech engine or live AI service is required.

The photo, travel, shopping and email examples are qualified as features that **some** products implement with AI. The alarm is ordinary automation. Product examples are supported by the source links on the lesson page; Maya's routes, times, products and messages are fictional. The learner still checks every result.
