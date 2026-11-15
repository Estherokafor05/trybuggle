// Starts analytics before the app is interactive: anonymous and cookieless for
// everyone, full tracking only for learners who agreed. See src/lib/analytics.ts.
import { startAnalytics } from "./lib/analytics";

try {
  void startAnalytics();
} catch {
  // Analytics must never break the site.
}
