import { Hono } from "hono";
import type { AuthEnv } from "../../middleware/env";
import { hub } from "../../ws/hub";

export const qaRoutes = new Hono<AuthEnv>()
  // List all active questions (sorted by upvotes descending)
  .get("/", (c) => {
    const questions = hub.getQuestions();
    return c.json({ questions });
  })

  // Submit a new question (alternative to WS)
  .post("/", async (c) => {
    const body = await c.req.json();
    const text = body?.text;

    if (
      !text ||
      typeof text !== "string" ||
      text.length < 1 ||
      text.length > 500
    ) {
      return c.json({ error: "Question text must be 1-500 characters" }, 400);
    }

    const user = c.get("user");
    const question = hub.addQuestion(text, user?.name ?? "Anonymous");

    return c.json(question, 201);
  })

  // Upvote a question
  .post("/:id/upvote", (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    const userId = user?.id ?? "anonymous";

    const result = hub.upvoteQuestion(id, userId);
    if (!result) {
      return c.json({ error: "Question not found" }, 404);
    }

    return c.json(result);
  });
