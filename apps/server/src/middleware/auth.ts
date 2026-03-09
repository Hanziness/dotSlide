import { type Role as PresentationRole, Role } from "@dotslide/protocol";
import { createMiddleware } from "hono/factory";
import type { auth } from "../auth";
import { getFreshSession } from "../session";

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
  presentationRole: PresentationRole;
};

export function getPresentationRole(
  session: typeof auth.$Infer.Session.session | null | undefined,
): PresentationRole {
  return session?.presentationRole === Role.Presenter
    ? Role.Presenter
    : Role.Viewer;
}

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const session = await getFreshSession(c.req.raw.headers);
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  c.set("presentationRole", getPresentationRole(session?.session));
  await next();
});
