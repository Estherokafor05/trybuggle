import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { googleLearnerId, learningIdentityCallbacks } from "@/lib/auth-callbacks";
import { claimGuest, forgetGuest, guestId } from "@/server/guest";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: learningIdentityCallbacks,
  events: {
    // Module 1 results earned as a guest move into the new account.
    async signIn({ account }) {
      if (account?.provider !== "google" || !account.providerAccountId) return;
      const guest = await guestId().catch(() => null);
      if (!guest) return;
      await claimGuest(guest, googleLearnerId(account.providerAccountId)).catch(() => undefined);
      await forgetGuest().catch(() => undefined);
    },
  },
});
