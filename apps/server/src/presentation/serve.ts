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

  // For HTML files, intercept and inject the client script
  app.get("*", async (c) => {
    const path = new URL(c.req.url).pathname;
    const filePath = path === "/" ? "/index.html" : path;

    const file = Bun.file(`${dir}${filePath}`);
    if (!(await file.exists())) {
      // SPA fallback: try index.html
      const indexFile = Bun.file(`${dir}/index.html`);
      if (!(await indexFile.exists())) {
        return c.notFound();
      }
      const html = await indexFile.text();
      return c.html(html.replace("</body>", `${INJECT_SCRIPT}</body>`));
    }

    const contentType = file.type;
    if (contentType?.includes("text/html")) {
      const html = await file.text();
      return c.html(html.replace("</body>", `${INJECT_SCRIPT}</body>`));
    }

    return new Response(file);
  });
}
