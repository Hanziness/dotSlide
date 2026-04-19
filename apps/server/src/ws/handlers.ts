import { ClientMessage } from "@dotslide/protocol";
import { and, eq } from "drizzle-orm";
import type { WSContext } from "hono/ws";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { user } from "../db/auth";
import { presentation, question } from "../db/dotslide";
import { roomManager } from "./hub";

export function handleMessage(ws: WSContext, raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
    return;
  }

  const result = ClientMessage.safeParse(parsed);
  if (!result.success) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Invalid message format",
      }),
    );
    return;
  }

  const msg = result.data;
  const user = roomManager.getUser(ws);

  if (!user) {
    ws.send(
      JSON.stringify({
        error: "No user found for this connection. Closing.",
      }),
    );
    // ws.close();
    return;
  }

  // Permission check
  if (!user.role) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: `Not permitted: ${msg.type}`,
      }),
    );
  }

  switch (msg.type) {
    case "navigate":
      handleNavigate(ws, msg);
      break;
    case "laser":
      handleLaser(ws, msg);
      break;
    case "question":
      handleQuestion(ws, msg);
      break;
    case "question:upvote":
      handleQuestionUpvote(ws, msg);
      break;
    case "sync:request":
      console.warn("Unimplemented sync message");
      break;
  }
}

async function handleNavigate(
  ws: WSContext,
  msg: Extract<ClientMessage, { type: "navigate" }>,
) {
  const user = roomManager.getUser(ws);
  if (!user) {
    return;
  }

  const state = (
    await db
      .select({
        state: presentation.state,
      })
      .from(presentation)
      .where(eq(presentation.id, user.room))
  )[0].state as Record<string, unknown>;

  let newIndex = state.navigationIndex;

  switch (msg.action) {
    case "next":
      newIndex = newIndex + 1;
      break;
    case "prev":
      newIndex = Math.max(newIndex - 1, 0);
      break;
    case "first":
      newIndex = 0;
      break;
    case "last":
      // Use numSlides as upper bound approximation
      newIndex = Math.max(state.numSlides - 1, 0);
      break;
    case "goTo":
      if (msg.index !== undefined) newIndex = Math.max(0, msg.index);
      break;
  }

  const res = await db
    .update(presentation)
    .set({
      state: {
        ...state,
        navigationIndex: newIndex,
      },
    })
    .where(eq(presentation.id, user.room))
    .returning();

  if (res.length === 0) {
    console.warn("Failed to update database");
  } else {
    console.debug(res);
  }

  roomManager.send(user.room, { type: "navigate", navigationIndex: newIndex });
}

function handleLaser(
  ws: WSContext,
  msg: Extract<ClientMessage, { type: "laser" }>,
) {
  const user = roomManager.getUser(ws);
  if (!user) {
    return;
  }

  if (!user.role) {
    console.warn(`User ${user.userId} is not allowed to modify laser`);
    return;
  }

  // Broadcast laser position to all clients except sender (the controller)
  const state = roomManager.getTemporalState(user.room);
  if (!state) {
    throw new Error(`Room ${user.room} has no temporal state`);
  }

  const newLaserStateMessage = {
    ...msg,
    lastUpdate: new Date(),
  };

  roomManager.updateTemporalState(user.room, {
    ...state,
    laser: newLaserStateMessage,
  });

  roomManager.send(user.room, newLaserStateMessage);
}

async function handleQuestion(
  ws: WSContext,
  msg: Extract<ClientMessage, { type: "question" }>,
) {
  const wsUser = roomManager.getUser(ws);
  if (!wsUser) {
    console.warn("Failed to submit question because user doesn't exist", msg);
    ws.send(JSON.stringify({ error: "User profile not found." }));
    return;
  }

  if (wsUser.role) {
    ws.send(JSON.stringify({ error: "Only viewers can submit questions" }));
    return;
  }

  const dbUser = (
    await db
      .select({
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, wsUser.userId))
  )[0];

  const res = await db
    .insert(question)
    .values({
      id: uuidv4(),
      text: msg.text,
      timestamp: new Date(),
      authorId: wsUser.userId,
      authorName: dbUser.name,
    })
    .returning();

  if (res.length < 1) {
    console.error(`Failed to insert question "${msg.text}" by ${dbUser.name}`);
    return;
  }

  roomManager.send(wsUser.room, {
    type: "question",
    id: res[0].id,
    author: res[0].authorName,
    text: res[0].text,
    timestamp: res[0].timestamp.getTime(),
    upvotes: 0,
  });
}

async function handleQuestionUpvote(
  ws: WSContext,
  msg: Extract<ClientMessage, { type: "question:upvote" }>,
) {
  const wsUser = roomManager.getUser(ws);
  if (!wsUser) {
    ws.send(JSON.stringify({ error: "User not found" }));
    return;
  }

  const dbUserRes = await db
    .select()
    .from(user)
    .where(eq(user.id, wsUser.userId));

  if (dbUserRes.length < 1) {
    ws.send(JSON.stringify({ error: "User not found in the database" }));
    return;
  }

  const dbUser = dbUserRes[0];

  const upvoteListRes = await db
    .select({
      upvotes: question.upvotes,
    })
    .from(question)
    .where(
      and(eq(question.presentation, wsUser.room), eq(question.id, msg.id)),
    );

  if (upvoteListRes.length < 1) {
    ws.send(
      JSON.stringify({
        error: `Question ${msg.id} not found in room ${wsUser.room}`,
      }),
    );
  }

  const upvoteList = upvoteListRes[0].upvotes;

  const upvoteIdx = upvoteList.indexOf(wsUser.userId);
  if (upvoteIdx >= 0) {
    // Take away upvote
    // TODO Should users be able to revoke their upvotes? Maybe not?
    upvoteList.splice(upvoteIdx, 1);
  } else {
    // Add upvote
    upvoteList.push(wsUser.userId);
  }

  const updateRes = await db
    .update(question)
    .set({
      upvotes: upvoteList,
    })
    .where(eq(question.id, msg.id))
    .returning();

  if (updateRes.length < 1) {
    ws.send(
      JSON.stringify({
        error: `Failed to insert upvote for question "${msg.id}"`,
      }),
    );
    return;
  }

  roomManager.send(wsUser.room, {
    type: "question:upvote",
    id: msg.id,
    upvotes: updateRes[0].upvotes.length,
  });
}
