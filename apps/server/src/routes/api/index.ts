import { Hono } from "hono";
import { presenterRoutes } from "./presenter";
import { qaRoutes } from "./qa";
import { slideRoutes } from "./slides";

export const apiRoutes = new Hono()
  .route("/presenter", presenterRoutes)
  .route("/slides", slideRoutes)
  .route("/qa", qaRoutes);
