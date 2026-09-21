import { canPresent } from "@dotslide/protocol";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import * as v from "valibot";
import type { AuthEnv } from "../../middleware/env";
import { getUserPresentationRole } from "../../session";
import { roomManager } from "../../ws/hub";

export const slideRoutes = new Hono<AuthEnv>()
  // Get a slide thumbnail
  .get(":roomId/:index/thumbnail", async (c) => {
    const index = Number.parseInt(c.req.param("index"), 10);
    if (Number.isNaN(index)) {
      return c.json({ error: "Invalid slide index" }, 400);
    }

    const thumbnail = roomManager.getThumbnail(c.req.param("roomId"), index);
    if (!thumbnail) {
      return c.json({ error: "Thumbnail not available" }, 404);
    }

    return c.body(await thumbnail.bytes(), 200, {
      "Content-Type": thumbnail.type,
      "Cache-Control": "public, max-age=3600",
    });
  })

  // Upload a slide thumbnail (from presenter's browser)
  .post(
    "/:roomId/:index/thumbnail",
    vValidator(
      "param",
      v.object({
        roomId: v.pipe(v.string(), v.uuid()),
        index: v.pipe(v.unknown(), v.transform(Number), v.number(), v.minValue(0)),
      }),
    ),
    vValidator("form", v.object({ file: v.instance(File) })),
    async (c) => {
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

      if (!canPresent(role)) {
        return c.json({ error: "Insufficient permissions.", role }, 401);
      }

      const file = c.req.valid("form").file;

      if (!file || !(file instanceof File)) {
        return c.json({ error: "No thumbnail file provided" }, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      roomManager.setThumbnail(c.req.param("roomId"), index, new Blob([buffer], { type: file.type }));

      return c.json({ ok: true });
    },
  );
