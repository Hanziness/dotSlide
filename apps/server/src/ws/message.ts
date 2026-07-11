import type { ServerMessage } from "@dotslide/protocol";
import type { WSContext } from "hono/ws";

/** Helper method to wrap sending a `ServerMessage` to a WebSocket connection */
export function sendServerMessage(connection: WSContext, msg: ServerMessage) {
  connection.send(JSON.stringify(msg));
}
