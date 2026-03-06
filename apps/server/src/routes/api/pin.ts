import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { auth } from "../../auth";
import { config } from "../../config";
import type { AuthEnv } from "../../middleware/env";

const PinSchema = z.object({ pin: z.string() });

export const pinRoutes = new Hono<AuthEnv>().post(
  "/claim-presenter",
  zValidator("json", PinSchema, (res, c) => {
    if (!res.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }
  }),
  async (c) => {
    const { pin } = await c.req.valid('json');

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

    // Upgrade the anonymous user's role to "presenter"
    await auth.api.setRole({
      body: { userId: user.id, role: "presenter" as const },
      headers: c.req.raw.headers,
    });

    return c.json({ role: "presenter" });
  },
);
