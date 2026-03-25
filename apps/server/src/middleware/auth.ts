import { createMiddleware } from "hono/factory";
import type { auth } from "../auth";
import { getFreshSession } from "../session";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const session = await getFreshSession(c.req.raw.headers);
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  await next();
});

/** @requires `authMiddleware` must run before this one */
export const requireLoginMiddleware = createMiddleware(async (c, next) => {
  const session = c.get("session")
  if (!session) {
    return c.json({ error: "You must be logged in to use this endpoint." }, 401)
  }
  await next()
})