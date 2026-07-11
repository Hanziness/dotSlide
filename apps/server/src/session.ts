import { type PresentationRole, toPresentationRole } from "@dotslide/protocol";
import { and, eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./db";
import { members } from "./db/dotslide";

const freshSessionQuery = {
  disableCookieCache: true,
} as const;

export async function getFreshSession(
  headers: Headers,
): Promise<Awaited<ReturnType<typeof auth.api.getSession>>> {
  return auth.api.getSession({
    headers,
    query: freshSessionQuery,
  });
}

export async function getUserPresentationRole(
  presentationId: string,
  userId: string,
): Promise<PresentationRole> {
  const res = await db
    .select()
    .from(members)
    .where(
      and(eq(members.presentation, presentationId), eq(members.user, userId)),
    );

  return toPresentationRole(res[0]?.role ?? null);
}