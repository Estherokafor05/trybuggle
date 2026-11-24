/** Google sign-in needs its client ID and secret; everything needs AUTH_SECRET. */
export const googleAuthConfigured = Boolean(
  process.env.AUTH_SECRET &&
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET,
);
