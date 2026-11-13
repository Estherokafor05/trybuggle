import type { NextAuthConfig } from "next-auth";

/** The stable learner ID for a Google account. */
export function googleLearnerId(providerAccountId: string) {
  return `google:${providerAccountId}`;
}

export const learningIdentityCallbacks: NonNullable<
  NextAuthConfig["callbacks"]
> = {
  jwt({ token, account }) {
    // Without an adapter, Auth.js creates a new user.id at each OAuth sign-in.
    // Only the provider's verified account identifier is stable across devices.
    if (account?.provider === "google" && account.providerAccountId) {
      token.learnerId = googleLearnerId(account.providerAccountId);
    }
    return token;
  },
  session({ session, token }) {
    if (session.user && typeof token.learnerId === "string") {
      session.user.id = token.learnerId;
    }
    return session;
  },
};
