import { hc } from "hono/client";
import type { AppType } from "./app";

export type { AppType } from "./app";

// this is a trick to calculate the type when compiling
// TODO This is now becoming `unknown` :(
export type Client = ReturnType<typeof hc<AppType>>;

export const dsClient = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);

export {
  type AuthClientType,
  createAuthClientInstance,
  refreshSession,
} from "./client/auth-client";
