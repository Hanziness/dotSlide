import { auth } from "./auth";

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
