import { Hono } from "hono";
import type { AuthEnv } from "../../middleware/env";
import { hub } from "../../ws/hub";

export const slideRoutes = new Hono<AuthEnv>()
  // List all slides with metadata
  .get("/", (c) => {
    const state = hub.getState();
    const metadata = hub.getSlideMetadata();
    return c.json({
      numSlides: state.numSlides,
      slides: metadata,
    });
  })

  // Get a slide thumbnail
  .get("/:index/thumbnail", (c) => {
    const index = Number.parseInt(c.req.param("index"), 10);
    if (Number.isNaN(index)) {
      return c.json({ error: "Invalid slide index" }, 400);
    }

    const thumbnail = hub.getThumbnail(index);
    if (!thumbnail) {
      return c.json({ error: "Thumbnail not available" }, 404);
    }

    return new Response(new Uint8Array(thumbnail), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600",
      },
    });
  })

  // Upload a slide thumbnail (from presenter's browser)
  .post("/:index/thumbnail", async (c) => {
    const index = Number.parseInt(c.req.param("index"), 10);
    if (Number.isNaN(index)) {
      return c.json({ error: "Invalid slide index" }, 400);
    }

    const user = c.get("user");
    if (!user || user.role !== "admin") {
      return c.json({ error: "Only the presenter can upload thumbnails" }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get("thumbnail");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No thumbnail file provided" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    hub.setThumbnail(index, buffer);

    return c.json({ ok: true });
  });
