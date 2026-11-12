import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { learningIdentityCallbacks } from "@/lib/auth-callbacks";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: learningIdentityCallbacks,
});
