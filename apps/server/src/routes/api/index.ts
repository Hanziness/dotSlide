import { Hono } from "hono";
import { qaRoutes } from "./qa";
import { slideRoutes } from "./slides";

export const apiRoutes = new Hono()
  .route("/slides", slideRoutes)
  .route("/qa", qaRoutes);
