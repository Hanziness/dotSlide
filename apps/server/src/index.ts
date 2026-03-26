import * as os from "node:os";
import { websocket } from "hono/bun";
import { app } from "./app";
import { config } from "./config";

function getLocalIP(): string {
  const interfaces = Object.values(os.networkInterfaces()).flat();
  const local = interfaces.find((i) => i?.family === "IPv4" && !i?.internal);
  return local?.address ?? "localhost";
}

const server = Bun.serve({
  port: config.port,
  fetch: app.fetch,
  websocket,
});

console.log(`dotslide server running on http://localhost:${server.port}`);
console.log(`Network: http://${getLocalIP()}:${server.port}`);
