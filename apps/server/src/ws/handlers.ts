import { ClientMessage, permissions, type Role } from "@dotslide/protocol";
import type { WSConnection } from "./hub";
import { hub } from "./hub";

export function handleMessage(ws: WSConnection, raw: string, role: Role) {
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

  // Permission check
  if (!permissions[role].has(msg.type)) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: `Not permitted: ${msg.type}`,
      }),
    );
    return;
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
      hub.sendSync(ws);
      break;
  }
}

function handleNavigate(
  _ws: WSConnection,
  msg: { action: string; index?: number },
) {
  const state = hub.getState();
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

  hub.updateState({ navigationIndex: newIndex });
  hub.broadcast({ type: "navigate", navigationIndex: newIndex });
}

function handleLaser(
  ws: WSConnection,
  msg: { x: number; y: number; visible: boolean },
) {
  // Broadcast laser position to all clients except sender (the controller)
  hub.broadcastExcept(ws, {
    type: "laser",
    x: msg.x,
    y: msg.y,
    visible: msg.visible,
  });
}

function handleQuestion(_ws: WSConnection, msg: { text: string }) {
  hub.addQuestion(msg.text, "Anonymous");
}

function handleQuestionUpvote(_ws: WSConnection, msg: { id: string }) {
  hub.upvoteQuestion(msg.id, "anonymous");
}
