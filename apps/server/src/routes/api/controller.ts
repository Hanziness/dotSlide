import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import type { AuthEnv } from "../../middleware/env";
import { hub } from "../../ws/hub";

export const controllerRoutes = new Hono<AuthEnv>()
  .post('/metadata', zValidator("json", z.object({}), async (c) => {
    // TODO Continue here
  }))
  .post(
    "/navigate/:idx",
    zValidator("param", z.object({ idx: z.coerce.number().gte(0) }), (res, c) => {
      if (!res.success) {
        return c.json({ error: "Invalid slide index" }, 400);
      }
    }),
    async (c) => {
      hub.broadcast({
        type: "navigate",
        navigationIndex: c.req.valid("param").idx,
      });

      return c.json({}, 200)
    },
  );
