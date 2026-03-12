import { eq } from "drizzle-orm";
import { auth } from "./auth";
import type { SessionRole } from "./auth/role";
import { db } from "./db";
import { session as sessionTable } from "./db/auth";

const freshSessionQuery = {
  disableCookieCache: true,
} as const;

export async function setSessionRole(id: string, role: SessionRole) {
  return await db
    .update(sessionTable)
    .set({ presentationRole: role })
    .where(eq(sessionTable.id, id));
}

export async function getFreshSession(
  headers: Headers,
): Promise<Awaited<ReturnType<typeof auth.api.getSession>>> {
  return auth.api.getSession({
    headers,
    query: freshSessionQuery,
  });
}
