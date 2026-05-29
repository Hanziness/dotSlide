import { createAuthClientInstance, dsClient } from "@dotslide/server/client";

const serverUrl =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:9876`
    : "http://localhost:9876";

export const client = dsClient(serverUrl, {
    init: {
        credentials: "include"
    }
 })

export const authClient = createAuthClientInstance(serverUrl)