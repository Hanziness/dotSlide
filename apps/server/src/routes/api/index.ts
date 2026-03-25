import { Hono } from "hono";
import type { AuthEnv } from "../../middleware/env";
import { controllerRoutes } from "./controller";
import { presenterRoutes } from "./presenter";
import { slideRoutes } from "./slides";

export const apiRoutes = new Hono<AuthEnv>()
  .route("/control", controllerRoutes)
  .route("/presenter", presenterRoutes)
  .route("/slides", slideRoutes)
