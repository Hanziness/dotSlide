import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { config } from "./config";
import { authMiddleware } from "./middleware/auth";
import { servePresentationWithInjection } from "./presentation/serve";
import { apiRoutes } from "./routes/api";
import { wsRoute } from "./routes/ws";

const app = new Hono();

// ── Global middleware ──
app.use("/api/*", cors({ origin: "*", credentials: true }));
app.use("/*", authMiddleware);

// ── Better Auth handler ──
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ── API routes (chained for RPC type inference) ──
const routes = app.route("/api", apiRoutes);

// ── WebSocket upgrade ──
app.route("/ws", wsRoute);

// ── Serve the remote client script (bundled framework/remote) ──
app.get(
  "/@dotslide/remote-client.js",
  serveStatic({
    path: "../../packages/remote/dist/remote-client.js",
  }),
);

// ── Serve the built presentation (with client injection) ──
servePresentationWithInjection(app, config.presentationDir);

export { app };
export type AppType = typeof routes;
