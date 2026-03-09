import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { config } from "../../config";
import { db } from "../../db";
import { session as authSession } from "../../db/auth";
import type { AuthEnv } from "../../middleware/env";

const PinSchema = z.object({ pin: z.string() });

export const pinRoutes = new Hono<AuthEnv>().post(
  "/claim",
  zValidator("json", PinSchema, (res, c) => {
    if (!res.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    const { pin } = c.req.valid("json");

    if (pin !== config.pin) {
      return c.json({ error: "Invalid PIN" }, 403);
    }

    const user = c.get("user");
    const session = c.get("session");
    if (!user || !session) {
      return c.json(
        { error: "Not authenticated. Sign in anonymously first." },
        401,
      );
    }

    await db
      .update(authSession)
      .set({ presentationRole: "presenter" })
      .where(eq(authSession.id, session.id));

    return c.json({ presentationRole: "presenter" });
  },
);
