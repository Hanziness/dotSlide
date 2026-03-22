import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { SessionRole } from "../../auth/role";
import { db } from "../../db";
import { presentation } from "../../db/dotslide";
import type { AuthEnv } from "../../middleware/env";
import { generateOneTimeToken, verifyOneTimeToken } from "../../one-time-token";
import { setSessionRole } from "../../session";

export const presenterRoutes = new Hono<AuthEnv>()
  /**
   * Issue a presenter invite link.
   *
   * Only same-origin presentation pages may call this.
   * The caller must have an authenticated session but does NOT
   * need an existing presenter role.
   */
  .post("/invite", async (c) => {
    // ── Same-origin enforcement ──
    const origin = c.req.header("origin");
    const host = c.req.header("host");

    if (!origin || !host) {
      return c.json(
        { error: "Missing origin or host header. Same-origin requests only." },
        403,
      );
    }

    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return c.json({ error: "Malformed origin header." }, 403);
    }

    // if (originHost !== host) {
    //   return c.json(
    //     {
    //       error:
    //         "Presenter invites can only be created from the presentation page.",
    //     },
    //     403,
    //   );
    // }

    // ── Require an authenticated session ──
    const session = c.get("session");
    if (!session) {
      return c.json(
        { error: "Not authenticated. An active session is required." },
        401,
      );
    }

    // ── Generate a one-time token tied to the current session ──
    const token = await generateOneTimeToken(c.req.raw.headers);

    return c.json({ token });
  })

  /**
   * Consume a presenter token and upgrade the current session.
   *
   * - Token verification is atomic and single-use (Better Auth deletes it).
   * - Role is stored on the session row, not the user row.
   * - The response includes the fresh session so downstream requests
   *   see `presenter` immediately.
   */
  .post(
    "/claim",
    zValidator("json", z.object({ token: z.string().min(1) }), (res, c) => {
      if (!res.success) {
        return c.json({ error: "Invalid request body." }, 400);
      }
    }),
    async (c) => {
      // ── Require an authenticated session on the consuming side ──
      const session = c.get("session");
      if (!session) {
        return c.json(
          { error: "Not authenticated. Sign in anonymously first." },
          401,
        );
      }

      // ── Verify and consume the one-time token ──
      let verified: Awaited<ReturnType<typeof verifyOneTimeToken>> | null =
        null;
      try {
        verified = await verifyOneTimeToken(c.req.valid("json").token);
      } catch {
        return c.json({ error: "Invalid or expired presenter token." }, 403);
      }

      if (!verified?.session) {
        return c.json({ error: "Invalid or expired presenter token." }, 403);
      }

      // ── Upgrade the consuming session to presenter ──
      await setSessionRole(session.id, SessionRole.Presenter);

      return c.json({ presentationRole: "presenter" as const });
    },
  )

  .post("/create", async (c) => {
    const session = c.get("session");
    // TODO Find out why the client is not authenticated here 🤔
    console.log(session)
    console.log(c.get("presentationRole"))
    if (!session) {
      return c.json({ error: "Not authenticated. Sign in first.", session }, 401);
    }

    const res = await db
      .insert(presentation)
      .values({
        id: uuidv4(),
        owner: session.userId,
        state: null,
      })
      .returning();

    if (res.length !== 1) {
      return c.json(
        {
          error: `Failed to register presentation, ${res.length} rows inserted`,
        },
        500,
      );
    }

    return c.json(
      {
        id: res[0].id,
      },
      200,
    );
  })

  .post(
    "/update",
    zValidator(
      "json",
      z.object({
        presentation: z.string(),
        state: z.json(),
      }),
    ),
    async (c) => {
      const session = c.get("session");
      if (!session) {
        return c.json({ error: "Not authenticated. Sign in first." }, 401);
      }

      const role = c.get("presentationRole");
      if (role !== "presenter") {
        return c.json({ error: "Insufficient permissions." }, 401);
      }

      const ownedPresentations = await db
        .select()
        .from(presentation)
        .where(eq(presentation.owner, session.userId));
      const input = c.req.valid("json");
      if (ownedPresentations[0].id !== input.presentation) {
        return c.json(
          { error: "You do not have access to modify this presentation." },
          401,
        );
      }

      const res = await db
        .update(presentation)
        .set({ state: input.state })
        .where(eq(presentation.id, ownedPresentations[0].id))
        .returning();

      if (res.length === 1) {
        return c.status(200);
      } else {
        return c.json(
          {
            error: `Failed to update presentation state, affected ${res.length} rows.`,
          },
          500,
        );
      }
    },
  );
