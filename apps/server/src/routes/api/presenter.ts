import { zValidator } from "@hono/zod-validator";
import { and, eq, gt, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { db } from "../../db";
import { invites, members, presentation } from "../../db/dotslide";
import type { AuthEnv } from "../../middleware/env";
import { getUserPresentationRole } from "../../session";

const invitationTokenSchema = z.custom<(typeof invites)["$inferSelect"]>();

export const presenterRoutes = new Hono<AuthEnv>()
  .get("/:roomId/me", async (c) => {
    const session = c.get("session")

    if (!session) {
      return c.json({ error: "You are not logged in." }, 401)
    }

    const currentRole = await getUserPresentationRole(c.req.param("roomId"), session.userId)

    return c.json({
      currentRole
    }, 200)
  })

  /**
   * Issue a presenter invite link.
   *
   * Only same-origin presentation pages may call this.
   * The caller must have an authenticated session but does NOT
   * need an existing presenter role.
   */
  .post("/:roomId/invite", async (c) => {
    // ── Require an authenticated session ──
    const session = c.get("session");
    if (!session) {
      return c.json(
        { error: "Not authenticated. An active session is required." },
        401,
      );
    }

    // Check if user actually owns the room
    const res = await getUserPresentationRole(
      c.req.param("roomId"),
      session.userId,
    );

    if (res !== "presenter") {
      return c.json({ error: "No matching presentation found" }, 401);
    }

    // ── Generate a one-time token tied to the current session ──
    // Insert invitation entry into db, generate 5-minute JWT to allow elevating permissions for this room
    const expiresAt = new Date(Date.now() + 300 * 1000);
    const payload = await db
      .insert(invites)
      .values({
        id: uuidv4(),
        issuedBy: session.userId,
        presentation: c.req.param("roomId"),
        expiresAt,
      })
      .returning();

    if (payload.length < 1) {
      return c.json({ error: "Failed to create invite" }, 500);
    }

    console.info(payload[0]);

    // Create JWT
    const token = await sign(payload[0], "supersecret", "HS256");

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
      let verified: z.output<typeof invitationTokenSchema> | null = null;
      try {
        verified = invitationTokenSchema.parse(
          await verify(c.req.valid("json").token, "supersecret", "HS256"),
        );
      } catch {
        return c.json({ error: "Invalid or expired presenter token." }, 403);
      }

      const currentRole = await getUserPresentationRole(
        verified.presentation,
        session.userId,
      );

      if (currentRole !== null) {
        return c.json({ error: "You are already elevated", currentRole, user: session.userId }, 400);
      }

      try {
        await db.transaction(async (tx) => {
          const inviteRes = await db
            .update(invites)
            .set({
              redeemedAt: new Date(),
            })
            .where(
              and(
                eq(invites.id, verified.id),
                isNull(invites.redeemedAt),
                gt(invites.expiresAt, new Date()),
              ),
            )
            .returning();

          if (inviteRes.length < 1) {
            tx.rollback();
            throw new Error("No valid invitation was found.");
          }

          const permissionUpdateRes = await db
            .insert(members)
            .values({
              presentation: verified.presentation,
              role: "controller",
              user: session.userId,
            })
            .returning();

          if (permissionUpdateRes.length < 1) {
            tx.rollback();
            throw new Error("Failed to update membership");
          }
        });
      } catch (err) {
        console.error(err);
        return c.json({ error: err }, 500);
      }

      return c.json({
        room: verified.presentation
      }, 200);
    },
  )

  .post("/create", async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json(
        { error: "Not authenticated. Sign in first.", session },
        401,
      );
    }

    try {
      const roomId = await db.transaction(async (tx) => {
        // Create room
        const res = await tx
          .insert(presentation)
          .values({
            id: uuidv4(),
            state: null,
          })
          .returning();

        if (res.length !== 1) {
          tx.rollback();
          throw new Error(
            `Inserted ${res.length} rows into table "presentation"`,
          );
        }

        const roomId = res[0].id;

        await tx.insert(members).values({
          user: session.userId,
          presentation: roomId,
          role: "presenter",
        });

        return roomId;
      });

      return c.json(
        {
          id: roomId,
        },
        200,
      );
    } catch (err) {
      return c.json({ error: err }, 500);
    }
  })

  .post(
    "/:roomId/update",
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

      const role = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.user, session.userId),
            eq(members.presentation, c.req.param("roomId")),
          ),
        );

      if (role.length < 1) {
        return c.json(
          {
            error: `Insufficient permissions to modify "${c.req.param("roomId")}"`,
          },
          401,
        );
      }

      const input = c.req.valid("json");

      const res = await db
        .update(presentation)
        .set({ state: input.state })
        .where(eq(presentation.id, c.req.param("roomId")))
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
