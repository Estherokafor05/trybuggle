// Plain-English messages for the admin pages.
export const adminErrors: Record<string, string> = {
  MISSING_FIELDS: "Fill in every field.",
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match an admin account.",
  INVALID_CODE: "That code didn't match. Try the newest code from your app.",
  INVALID_TWO_FACTOR_COOKIE: "Your sign-in took too long. Start again with your email and password.",
  INVALID_BACKUP_CODE: "That backup code didn't work. Each one works only once.",
  TOO_MANY_ATTEMPTS: "Too many tries. Wait 15 minutes, then try again.",
  ACCOUNT_LOCKED: "Too many wrong codes. Wait 15 minutes, then try again.",
  PASSWORDS_DIFFER: "The two passwords don't match.",
};

export const adminNotices: Record<string, string> = {
  "access-given": "Access given.",
  "access-ended": "Access ended.",
  "learner-photo": "Photo removed. Their initials show instead.",
  "learner-hide": "Hidden from leaderboards.",
  "learner-show": "Shown on leaderboards again.",
  "learner-sign-out": "Signed out on every device.",
  "learner-confirm-email": "Email marked as confirmed.",
  "org-plan": "Plan saved.",
  "org-rename": "Name saved.",
  "org-remove": "Member removed.",
  "org-role": "Role saved.",
  "pricing-saved": "Saved. New prices and offers apply to the next checkout.",
  "signed-out": "You've signed out of the admin area.",
  joined: "Your admin account is ready. Sign in, then set up your authenticator app.",
  "two-factor-on": "Your authenticator app is set up. You'll need a code each time you sign in.",
  "invite-cancelled": "Invite cancelled. Its link no longer works.",
  "admin-removed": "Admin removed and signed out everywhere.",
  "settings-saved": "Saved. The new settings apply to the next attempt anyone makes.",
  "try-given": "Done. The learner has one more try.",
  "certificate-withdrawn": "Certificate withdrawn. Its check page now says so.",
  "certificate-restored": "Certificate restored. Its check page shows it as real again.",
  "forum-hidden": "Hidden. Learners now see that the team hid it.",
  "forum-shown": "Shown again.",
  "report-kept": "Report closed. The post stays up.",
  "forum-saved": "Saved.",
  "questions-saved": "Questions saved. Learners get them from their next attempt; earlier results don't change.",
  "plan-saved": "Plan saved. New checkouts use this price; current plans keep theirs until they renew.",
};

export const adminMessage = (map: Record<string, string>, key?: string) =>
  key ? (map[key] ?? (map === adminErrors ? "Something went wrong. Please try again." : null)) : null;
