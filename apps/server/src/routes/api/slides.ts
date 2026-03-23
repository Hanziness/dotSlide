import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import type { AuthEnv } from "../../middleware/env";
import { getUserPresentationRole } from "../../session";
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
  .post(
    "/:roomId/:index/thumbnail",
    zValidator("param", z.object({ roomId: z.uuidv4(), index: z.coerce.number().gte(0) })),
    zValidator("form", z.object({ file: z.instanceof(File) })),
    async (c) => {
      console.info("Incoming thumbnail upload");
      const index = c.req.valid("param").index;

      const user = c.get("user");
      if (!user) {
        return c.json(
          { error: "You are not authenticated. Log in first." },
          401,
        );
      }

      const role = await getUserPresentationRole(
        c.req.param("roomId"),
        user.id,
      );

      if (role !== "presenter") {
        return c.json({ error: "Insufficient permissions.", role }, 401);
      }

      const file = c.req.valid("form").file;

      if (!file || !(file instanceof File)) {
        return c.json({ error: "No thumbnail file provided" }, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      hub.setThumbnail(index, buffer);

      return c.json({ ok: true });
    },
  );
