// Plain-English messages for sign-in problems. Codes come from Better Auth
// (UPPER_CASE), from Google sign-in returns (lower_case), or from our own forms.
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match. Check them and try again, or reset your password.",
  EMAIL_NOT_VERIFIED: "Confirm your email first. Open the link we emailed you, or ask for a new one.",
  USER_ALREADY_EXISTS: "An account already uses this email. Log in instead, or reset your password.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account already uses this email. Log in instead, or reset your password.",
  PASSWORD_TOO_SHORT: "Use at least 8 characters for your password.",
  PASSWORD_TOO_LONG: "Use 128 characters or fewer for your password.",
  INVALID_EMAIL: "Enter a full email address, like name@example.com.",
  INVALID_TOKEN: "This link has expired or was already used. Ask for a new one.",
  TOKEN_EXPIRED: "This link has expired. Ask for a new one.",
  AGE_REQUIRED: "Buggle Learn is for people aged 15 and over. Tick the box to confirm your age.",
  MISSING_FIELDS: "Fill in every field.",
  PASSWORDS_DIFFER: "The two passwords don't match.",
  TOO_MANY_REQUESTS: "Too many tries in a short time. Wait a minute, then try again.",
  GOOGLE_UNAVAILABLE: "Google sign-in isn't available right now. Use your email and password, or try again later.",
  signup_disabled:
    "No Buggle Learn account uses this Google account yet. Create an account below. If you learned with Buggle Learn before, your progress comes with you.",
  account_not_linked:
    "This email already has a Buggle Learn account. Log in with your email and password, then link Google in Your account.",
  unable_to_link_account: "That Google account couldn't be linked. Try again, or use another Google account.",
  account_already_linked_to_different_user: "That Google account is already linked to a different Buggle Learn account.",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "You need at least one way to log in. Add a password before removing Google.",
  INVALID_PASSWORD: "Your current password isn't right. Try again, or log out and reset it.",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "That Google account is already linked to a Buggle Learn account.",
  LINKED_ACCOUNT_ALREADY_EXISTS: "That Google account is already linked to a Buggle Learn account.",
  SESSION_NOT_FRESH: "For your security, log out and log in again, then try once more.",
  PHOTO_MISSING: "Choose a photo first.",
  PHOTO_TOO_BIG: "That photo is too big. Try a smaller one.",
  PHOTO_TYPE: "Use a PNG, JPEG or WebP photo.",
  LANGUAGE: "Choose one of the languages that's ready.",
  state_mismatch: "Your sign-in took too long or was opened in another browser. Please try again.",
};

/** The message for a code, or a general one for anything unexpected. */
export function authMessage(code: string | undefined) {
  if (!code) return null;
  const key = code in messages ? code : code.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return messages[key] ?? "Something went wrong. Please try again.";
}

/** Messages that confirm something worked, shown in green. */
export const notices: Record<string, string> = {
  PASSWORD_RESET: "Your password has been changed. Log in with your new password.",
  NAME_SAVED: "Your name has been saved. New certificates will use it.",
  PASSWORD_SAVED: "Your password has been saved. You're still logged in here; other devices were logged out.",
  GOOGLE_LINKED: "Google is now linked. You can log in with Google or your password.",
  UNLINKED: "That sign-in method has been removed.",
  LANGUAGE_SAVED: "Language saved.",
  LEADERBOARD_SHOWN: "You're on the leaderboards again.",
  LEADERBOARD_HIDDEN: "You're hidden from leaderboards. You still earn points and badges.",
  PHOTO_SAVED: "Your photo has been saved.",
  PHOTO_REMOVED: "Your photo has been removed. Your initials show instead.",
};
