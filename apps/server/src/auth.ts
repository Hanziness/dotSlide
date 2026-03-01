import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, bearer } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  plugins: [
    anonymous(), // Viewers get instant sessions (no sign-up)
    admin(), // Adds `role` field to user, enables role management
    bearer(), // Supports Authorization: Bearer for WS handshake
  ],
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min cache to reduce DB hits
    },
  },
  advanced: {
    // Disable Secure flag for local HTTP usage
    useSecureCookies: false,
  },
});
