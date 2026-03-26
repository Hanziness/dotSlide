import { type Auth, type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins/anonymous";
import { bearer } from "better-auth/plugins/bearer";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { presenterOneTimeTokenTTLMinutes } from "./auth/presenter-token";
import { db } from "./db";
import * as schema from "./db/auth";

type DotslideAuthOptions = BetterAuthOptions & {
  plugins: [
    ReturnType<typeof anonymous>,
    ReturnType<typeof bearer>,
    ReturnType<typeof oneTimeToken>,
  ];
  session: NonNullable<BetterAuthOptions["session"]> & {
    additionalFields: {
      presentationRole: {
        type: ["viewer", "presenter"];
        required: false;
        defaultValue: "viewer";
        input: false;
      };
    };
  };
};

const authOptions: DotslideAuthOptions = {
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
    bearer(), // Supports Authorization: Bearer for WS handshake
    oneTimeToken({
      expiresIn: presenterOneTimeTokenTTLMinutes,
    }),
  ],
  session: {
    additionalFields: {
      presentationRole: {
        type: ["viewer", "presenter"],
        required: false,
        defaultValue: "viewer",
        input: false,
      },
    },
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
  trustedOrigins: ["http://localhost:5173", "http://localhost:4321", "http://localhost:4322"],
  baseURL: "http://localhost:3000"
};

export const auth: Auth<DotslideAuthOptions> = betterAuth(authOptions);
