import { dsClient } from "@dotslide/server/client";

export const client = dsClient('http://localhost:9876', {
    init: {
        credentials: "include"
    }
})