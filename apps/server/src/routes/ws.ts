import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { getFreshSession, getUserPresentationRole } from "../session";
import { handleMessage } from "../ws/handlers";
import { hub } from "../ws/hub";

export { websocket };

export const wsRoute = new Hono().get(
  "/:roomId",
  async (c) => {
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

    // TODO Close connection
    if (userId === null) {
      throw new Error("Unauthenticated")
    }
    const role = await getUserPresentationRole(c.req.param("roomId"), userId)

    return upgradeWebSocket(c, {
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
      })
  })
