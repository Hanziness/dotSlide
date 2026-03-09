import type { Role } from "@dotslide/protocol";
import type { auth } from "../auth";

/**
 * Hono environment type with auth variables.
 * Use this in route Hono constructors to get proper typing
 * for `c.get("user")` and `c.get("session")`.
 */
export type AuthEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    presentationRole: Role;
  };
};
