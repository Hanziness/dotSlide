import type { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { INJECT_SCRIPT } from "./inject";

/**
 * Serve a built Astro presentation from a directory, injecting the
 * remote client script into HTML responses.
 */
export function servePresentationWithInjection(app: Hono, dir: string) {
  // Serve non-HTML assets directly
  app.use("/slideshow/*", serveStatic({ root: dir }));

  console.info("Serving presentation from", dir)
}
