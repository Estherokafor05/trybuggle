import { toNextJsHandler } from "better-auth/next-js";
import { adminAuth } from "@/admin-auth";

// Admin sign-in only. There is no sign-up route: admins join by invite.
export const { GET, POST } = toNextJsHandler(adminAuth);
