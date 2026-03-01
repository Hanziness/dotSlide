import { Hono } from "hono";
import { pinRoutes } from "./pin";
import { qaRoutes } from "./qa";
import { slideRoutes } from "./slides";

export const apiRoutes = new Hono()
  .route("/", pinRoutes)
  .route("/slides", slideRoutes)
  .route("/qa", qaRoutes);
