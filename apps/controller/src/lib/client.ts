import { createAuthClientInstance, dsClient } from "@dotslide/server/client";

export const client = dsClient('http://localhost:9876', {
    init: {
        credentials: "include"
    }
 })

export const authClient = createAuthClientInstance()