import { createAuthClient } from "better-auth/client";
import {
  anonymousClient,
  oneTimeTokenClient,
} from "better-auth/client/plugins";
import { bearer } from "better-auth/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:9876",
  plugins: [
    anonymousClient(), // Viewers get instant sessions (no sign-up)
    oneTimeTokenClient(),
    bearer(), // Supports Authorization: Bearer for WS handshake
  ],
});

export async function refreshSession(): Promise<
  Awaited<ReturnType<typeof authClient.getSession>>
> {
  return authClient.getSession({
    query: {
      disableCookieCache: true,
    },
  });
}
