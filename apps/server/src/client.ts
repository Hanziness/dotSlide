import { hc } from "hono/client";
import type { AppType } from "./app";

// this is a trick to calculate the type when compiling
export type Client = ReturnType<typeof hc<AppType>>;

export const dsClient = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);
