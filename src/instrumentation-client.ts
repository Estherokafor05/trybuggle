// Starts analytics before the app is interactive, but only for learners who
// already agreed to it on a previous visit. See src/lib/analytics.ts.
import { analyticsChoice, startAnalytics } from "./lib/analytics";

try {
  if (analyticsChoice() === "yes") void startAnalytics();
} catch {
  // Analytics must never break the site.
}
