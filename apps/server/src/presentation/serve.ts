import type { Hono } from "hono";
import { serveStatic } from "hono/bun";

/**
 * Serve a built Astro presentation from a directory.
 */
export function servePresentationWithInjection(app: Hono, dir: string) {
  // Serve non-HTML assets directly
  app.use("/slideshow/*", serveStatic({ root: dir }));

  console.info("Serving presentation from", dir)
}
