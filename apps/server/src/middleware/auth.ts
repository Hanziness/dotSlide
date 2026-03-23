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
