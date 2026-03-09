import type { Role } from "@dotslide/protocol";
import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { getPresentationRole } from "../middleware/auth";
import { getFreshSession } from "../session";
import { handleMessage } from "../ws/handlers";
import { hub } from "../ws/hub";

export { websocket };

export const wsRoute = new Hono().get(
  "/",
  upgradeWebSocket(async (c) => {
    // Authenticate from cookie or ?token= query param
    let session = await getFreshSession(c.req.raw.headers);

    if (!session) {
      const token = new URL(c.req.url).searchParams.get("token");
      if (token) {
        session = await getFreshSession(
          new Headers({ Authorization: `Bearer ${token}` }),
        );
      }
    }

    const userId = session?.user?.id ?? null;
    const role: Role = getPresentationRole(session?.session);

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
