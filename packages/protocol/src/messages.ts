import * as v from "valibot";
import { PresentationRoleSchema } from "./roles";
import { NavigationSnapshotSchema } from "./state";

// ─── Server → Client messages ─────────────────────────────────

export const NavigateBroadcast = v.object({
  type: v.literal("navigate"),
  navigationIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export const LaserBroadcast = v.object({
  type: v.literal("laser"),
  /** X position normalized to [0, 1] relative to slide width */
  x: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  /** Y position normalized to [0, 1] relative to slide height */
  y: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  /** Whether the laser pointer is visible */
  lastUpdate: v.date(),
});

export const SyncBroadcast = v.object({
  ...NavigationSnapshotSchema.entries,
  type: v.literal("sync"),
});

export const QuestionBroadcast = v.object({
  type: v.literal("question"),
  id: v.string(),
  text: v.string(),
  author: v.string(),
  timestamp: v.number(),
  upvotes: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export const QuestionUpvoteBroadcast = v.object({
  type: v.literal("question:upvote"),
  id: v.string(),
  upvotes: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export const RoleAssigned = v.object({
  type: v.literal("role"),
  role: PresentationRoleSchema,
});

export const ErrorMessage = v.object({
  type: v.literal("error"),
  message: v.string(),
});

export const ServerMessage = v.variant("type", [
  NavigateBroadcast,
  LaserBroadcast,
  SyncBroadcast,
  QuestionBroadcast,
  QuestionUpvoteBroadcast,
  RoleAssigned,
  ErrorMessage,
]);

export type ServerMessage = v.InferOutput<typeof ServerMessage>;

// ─── Client → Server messages ─────────────────────────────────

export const NavigateRequest = v.object({
  type: v.literal("navigate"),
  action: v.picklist(["next", "prev", "first", "last", "goTo"]),
  /** Required when action is "goTo" */
  index: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
});

export const LaserUpdate = v.object({
  type: v.literal("laser"),
  x: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
  y: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
});

export const QuestionSubmit = v.object({
  type: v.literal("question"),
  text: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
});

export const QuestionUpvoteRequest = v.object({
  type: v.literal("question:upvote"),
  id: v.string(),
});

export const SyncRequest = v.object({
  type: v.literal("sync:request"),
});

export const ClientMessage = v.variant("type", [
  NavigateRequest,
  LaserUpdate,
  QuestionSubmit,
  QuestionUpvoteRequest,
  SyncRequest,
]);

export type ClientMessage = v.InferOutput<typeof ClientMessage>;
