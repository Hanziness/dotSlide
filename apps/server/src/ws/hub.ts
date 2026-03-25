import type { ServerMessage } from "@dotslide/protocol";
import { eq } from "drizzle-orm";
import type { WSContext } from "hono/ws";
import { db } from "../db";
import { presentation } from "../db/dotslide";

interface User {
  userId: string;
  room: string;
  role: string | null;
}

const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export interface RoomImmediateState {
  laser: {
    x: number;
    y: number;
    lastUpdate: Date;
  };
  /** Navigation index -> file mapping */
  thumbnails: Map<number, Blob>
}

class RoomManager {
  /** Websocket rooms, maps to a set of connections */
  private rooms: Map<string, Set<WSContext>>;
  /** User map, storing information for each connected user */
  private users: Map<WSContext, User>;
  /** Temporal (non-persistent) state for rooms */
  private temporalState: Map<string, RoomImmediateState>;

  // TODO Who creates `User` objects?
  // WebSocket room manager: https://oneuptime.com/blog/post/2026-01-24-websocket-room-channel-management/view

  constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.temporalState = new Map();
  }

  async join(ws: WSContext, user: User) {
    const room = user.room;
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
      this.temporalState.set(room, {
        laser: { x: 0, y: 0, lastUpdate: new Date(0) },
        thumbnails: new Map()
      });
    }

    // Add connection to room
    this.rooms.get(room)?.add(ws);
    this.users.set(ws, user);
  }

  async leave(ws: WSContext) {
    this.rooms.forEach((connections) => {
      if (connections.has(ws)) {
        connections.delete(ws);
      }
    });

    this.users.delete(ws);
  }

  /** Server method for broadcasting a message to all connected clients */
  send(room: string, msg: ServerMessage) {
    this.rooms.get(room)?.forEach((connection) => {
      connection.send(JSON.stringify(msg));
    });
  }

  getUser(ws: WSContext): User | undefined {
    return this.users.get(ws);
  }

  getTemporalState(room: string): RoomImmediateState | undefined {
    return this.temporalState.get(room);
  }

  updateTemporalState(room: string, newState: RoomImmediateState) {
    if (!this.temporalState.get(room)) {
      console.warn(`Room ${room} has no temporal state`);
      return;
    }

    this.temporalState.set(room, newState);
  }

  getThumbnail(room: string, index: number): Blob | undefined {
    return this.getTemporalState(room)?.thumbnails?.get(index)
  }

  setThumbnail(room: string, index: number, file: Blob) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Received: ${file.type}`)
    }

    this.temporalState.get(room)?.thumbnails.set(index, file)
  }
}

/** Default `RoomManager` instance */
export const roomManager = new RoomManager();
