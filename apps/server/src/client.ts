import { hc } from "hono/client";
import type { AppType } from "./app";

export type { AppType } from "./app";

export type Client = ReturnType<typeof hc<AppType>>;

export const dsClient = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);

export {
  type AuthClientType,
  createAuthClientInstance,
  refreshSession,
} from "./client/auth-client";
