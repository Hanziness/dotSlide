import { Hono } from "hono";
import { z } from "zod";
import { auth } from "../../auth";
import { config } from "../../config";
import type { AuthEnv } from "../../middleware/env";

const PinSchema = z.object({ pin: z.string() });

export const pinRoutes = new Hono<AuthEnv>().post(
  "/claim-presenter",
  async (c) => {
    const body = await c.req.json();
    const result = PinSchema.safeParse(body);

    if (!result.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const { pin } = result.data;

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
    // TODO: Better Auth admin plugin only supports "user" | "admin" by default.
    // Configure custom roles or use a different role storage mechanism.
    await auth.api.setRole({
      body: { userId: user.id, role: "admin" as const },
      headers: c.req.raw.headers,
    });

    return c.json({ role: "presenter" });
  },
);
