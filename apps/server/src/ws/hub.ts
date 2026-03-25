import type { ClientMessage, ServerMessage } from "@dotslide/protocol";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { presentation } from "../db/dotslide";

interface User {
  userId: string;
  room: string;
  role: string | null;
}

class RoomManager {
  /** Websocket rooms, maps to a set of connections */
  private rooms: Map<string, Set<WebSocket>>;
  /** User map, storing information for each connected user */
  private users: Map<WebSocket, User>;

  // TODO Who creates `User` objects?
  // WebSocket room manager: https://oneuptime.com/blog/post/2026-01-24-websocket-room-channel-management/view

  constructor() {
    this.rooms = new Map();
    this.users = new Map();
  }

  async join(ws: WebSocket, user: User) {
    const room = user.room
    if (!this.rooms.has(room)) {
      // Check if room exists in the database
      const res = await db
        .select({ roomId: presentation.id })
        .from(presentation)
        .where(eq(presentation.id, room));
      if (res.length !== 1) {
        throw new Error(`Presentation "${room}" doesn't exist`);
      }

      // Create room
      this.rooms.set(room, new Set());
    }

    // Add connection to room
    this.rooms.get(room)?.add(ws);
    this.users.set(ws, user);
  }

  async leave(ws: WebSocket) {
    this.rooms.forEach((connections) => {
      if (connections.has(ws)) {
        connections.delete(ws);
      }
    });

    this.users.delete(ws);
  }

  /** Server method for broadcasting a message to all connected clients */
  async send(room: string, msg: ServerMessage) {
    this.rooms.get(room)?.forEach((connection) => {
      connection.send(JSON.stringify(msg));
    });
  }

  /** Handle incoming client messages */
  private async receive(ws: WebSocket, msg: ClientMessage) {
    const user = this.users.get(ws)

    if (!user) {
      throw new Error("No user registered for this connection")
    }

    // Whether the user has permissions to control the presentation
    const isElevated = user.role != null

    switch (msg.type) {
      case "navigate": {
        return;
      }
    }
  }
}

/** Default `RoomManager` instance */
export const roomManager = new RoomManager()