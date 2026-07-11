import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { config } from "./config";
import { authMiddleware } from "./middleware/auth";
import type { AuthEnv } from "./middleware/env";
import { isLocalDevelopmentOrigin } from "./network";
import { apiRoutes } from "./routes/api";

const app = new Hono<AuthEnv>()
  // ── Global middleware ──
  .use(
    "/api/*",
    cors({
      origin: (origin) =>
        origin !== undefined && isLocalDevelopmentOrigin(origin) ? origin : null,
      credentials: true,
    }),
  )
  .use("/*", authMiddleware)

  // ── Better Auth handler ──
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))

  // --- API routes ---
  .route("/api", apiRoutes)

  // ── Serve the built presentation (with client injection) ──
  .use("/slideshow/*", serveStatic({ root: config.presentationDir }));

export { app };
export type AppType = typeof app;
