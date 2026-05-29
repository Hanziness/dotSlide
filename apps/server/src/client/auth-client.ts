import { createAuthClient } from "better-auth/client";
import {
  anonymousClient,
  oneTimeTokenClient,
} from "better-auth/client/plugins";
import { bearer } from "better-auth/plugins";

export function createAuthClientInstance(serverUrl: string) {
  return createAuthClient({
    serverUrl,
    plugins: [
      anonymousClient(), // Viewers get instant sessions (no sign-up)
      oneTimeTokenClient(),
      bearer(), // Supports Authorization: Bearer for WS handshake
    ],
  });
}

export type AuthClientType = ReturnType<typeof createAuthClientInstance>

export async function refreshSession(client: AuthClientType) {
  return client.getSession({
    query: {
      disableCookieCache: true,
    },
  });
}
