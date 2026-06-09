import type { AuthClientType, Client } from "@dotslide/server/client";
import { createContext } from "@lit/context";

export interface RemoteContext {
  dsClient: Client;
  auth: AuthClientType;
  roomId?: string;
  host: string;
  controllerPort: number;
  createRoom: () => Promise<string>;
}

export const remoteContext = createContext<RemoteContext>(Symbol('ds-remote-context'))