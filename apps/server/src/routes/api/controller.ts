import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod";
import { db } from "../../db";
import { presentation } from "../../db/dotslide";
import { requireLoginMiddleware } from "../../middleware/auth";
import type { AuthEnv } from "../../middleware/env";
import { getUserPresentationRole } from "../../session";
import { roomManager } from "../../ws/hub";

// TODO Most of these methods require elevated permissions which are not yet checked!

export const controllerRoutes = new Hono<AuthEnv>()
  .use("/*", requireLoginMiddleware)
  .get("/:roomId/metadata", async (c) => {
    const roomMeta = await db
      .select({
        metadata: presentation.state,
      })
      .from(presentation)
      .where(eq(presentation.id, c.req.param("roomId")));

    if (roomMeta.length < 1) {
      return c.json({ error: "Presentation not found." }, 404);
    }

    return c.json(roomMeta[0], 200);
  })
  .post("/:roomId/metadata", zValidator("json", z.looseObject({})), async (c) => {
    // Check user role
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthenticated." }, 401);
    }

    // Check if currentRole is not `null` (i.e., user is not viewer)
    const currentRole = await getUserPresentationRole(
      c.req.param("roomId"),
      session.userId,
    );

    if (!currentRole) {
      return c.json(
        { error: "You are not authorized to update this presentation." },
        401,
      );
    }

    // Try to update presentation state
    const res = await db
      .update(presentation)
      .set({
        state: c.req.valid("json"),
      })
      .where(eq(presentation.id, c.req.param("roomId")))
      .returning()

    if (res.length !== 1) {
      return c.json({ error: "Failed to update presentation state" }, 500)
    }

    console.log(res)

    return c.text("OK", 200)
  })
  .post(
    "/:roomId/navigate/:idx",
    zValidator(
      "param",
      z.object({ idx: z.coerce.number().gte(0) }),
      (res, c) => {
        if (!res.success) {
          return c.json({ error: "Invalid slide index" }, 400);
        }
      },
    ),
    async (c) => {
      roomManager.send(c.req.param("roomId"), {
        type: "navigate",
        navigationIndex: c.req.valid("param").idx,
      });

      return c.json({}, 200);
    },
  );
