import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { getFreshSession, getUserPresentationRole } from "../session";
import { handleMessage } from "../ws/handlers";
import { roomManager } from "../ws/hub";

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

    // Do not upgrade the connection
    if (userId === null) {
      return c.json({ error: "You are not logged in." }, 401)
    }
    const role = await getUserPresentationRole(c.req.param("roomId"), userId)

    return upgradeWebSocket(c, {
        onOpen(_event, ws) {
          roomManager.join(ws, { room: c.req.param("roomId"), userId, role });
          // Inform client of their role
          ws.send(JSON.stringify({ type: "role", role }));
        },

        onMessage(event, ws) {
          const data = typeof event.data === "string" ? event.data : "";
          handleMessage(ws, data);
        },

        onClose(_event, ws) {
          roomManager.leave(ws);
        },
      })
  })
