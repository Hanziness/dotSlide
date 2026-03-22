import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { config } from "./config";
import { authMiddleware } from "./middleware/auth";
import type { AuthEnv } from "./middleware/env";
import { servePresentationWithInjection } from "./presentation/serve";
import { apiRoutes } from "./routes/api";
import { wsRoute } from "./routes/ws";

const app = new Hono<AuthEnv>();

// ── Global middleware ──
app.use(
  "/api/*",
  cors({
    origin: [
      "localhost",
      "http://localhost:5173",
      "http://localhost:4321",
      "http://localhost:4322",
    ],
    credentials: true,
  }),
);
app.use("/*", authMiddleware);

// ── Better Auth handler ──
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ── API routes (chained for RPC type inference) ──
const routes = app.route("/api", apiRoutes);

// ── WebSocket upgrade ──
app.route("/ws", wsRoute);

// ── Serve the built presentation (with client injection) ──
servePresentationWithInjection(app, config.presentationDir);

export { app };
export type AppType = typeof routes;
