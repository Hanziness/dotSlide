import type { Role } from "@dotslide/protocol";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { auth } from "../auth";
import { handleMessage } from "../ws/handlers";
import { hub } from "../ws/hub";

const { upgradeWebSocket, websocket } = createBunWebSocket();

export { websocket };

export const wsRoute = new Hono().get(
  "/",
  upgradeWebSocket(async (c) => {
    // Authenticate from cookie or ?token= query param
    let session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      const token = new URL(c.req.url).searchParams.get("token");
      if (token) {
        session = await auth.api.getSession({
          headers: new Headers({ Authorization: `Bearer ${token}` }),
        });
      }
    }

    const userId = session?.user?.id ?? null;
    const role: Role = (session?.user?.role as Role) ?? "viewer";

    return {
      onOpen(_event, ws) {
        hub.addConnection(ws, { userId, role });
        // Send current state immediately
        hub.sendSync(ws);
        // Inform client of their role
        ws.send(JSON.stringify({ type: "role", role }));
      },

      onMessage(event, ws) {
        const data = typeof event.data === "string" ? event.data : "";
        handleMessage(ws, data, role);
      },

      onClose(_event, ws) {
        hub.removeConnection(ws);
      },
    };
  }),
);
