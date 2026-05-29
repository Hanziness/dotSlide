import { createAuthClientInstance, dsClient } from "@dotslide/server/client";

// Derive server host from the browser's current hostname (same site, different port)
const serverUrl =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:9876`
    : "http://localhost:9876";

export const client = dsClient(serverUrl, {
  init: {
    credentials: "include",
  },
});

export const authClient = createAuthClientInstance(serverUrl)