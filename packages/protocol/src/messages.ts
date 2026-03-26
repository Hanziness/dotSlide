import { z } from "zod";

// ─── Server → Client messages ─────────────────────────────────

export const NavigateBroadcast = z.object({
  type: z.literal("navigate"),
  navigationIndex: z.number().int().min(0),
});

export const LaserBroadcast = z.object({
  type: z.literal("laser"),
  /** X position normalized to [0, 1] relative to slide width */
  x: z.number().min(0).max(1),
  /** Y position normalized to [0, 1] relative to slide height */
  y: z.number().min(0).max(1),
  /** Whether the laser pointer is visible */
  lastUpdate: z.date(),
});

export const SyncBroadcast = z.object({
  type: z.literal("sync"),
  navigationIndex: z.number().int().min(0),
  numSlides: z.number().int().min(0),
  activeSlide: z.number().int().min(0),
  activeStep: z.number().int().min(1),
});

export const QuestionBroadcast = z.object({
  type: z.literal("question"),
  id: z.string(),
  text: z.string(),
  author: z.string(),
  timestamp: z.number(),
  upvotes: z.number().int().min(0),
});

export const QuestionUpvoteBroadcast = z.object({
  type: z.literal("question:upvote"),
  id: z.string(),
  upvotes: z.number().int().min(0),
});

export const RoleAssigned = z.object({
  type: z.literal("role"),
  role: z.enum(["presenter", "viewer"]),
});

export const ErrorMessage = z.object({
  type: z.literal("error"),
  message: z.string(),
});

export const ServerMessage = z.discriminatedUnion("type", [
  NavigateBroadcast,
  LaserBroadcast,
  SyncBroadcast,
  QuestionBroadcast,
  QuestionUpvoteBroadcast,
  RoleAssigned,
  ErrorMessage,
]);

export type ServerMessage = z.infer<typeof ServerMessage>;

// ─── Client → Server messages ─────────────────────────────────

export const NavigateRequest = z.object({
  type: z.literal("navigate"),
  action: z.enum(["next", "prev", "first", "last", "goTo"]),
  /** Required when action is "goTo" */
  index: z.number().int().min(0).optional(),
});

export const LaserUpdate = z.object({
  type: z.literal("laser"),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const QuestionSubmit = z.object({
  type: z.literal("question"),
  text: z.string().min(1).max(500),
});

export const QuestionUpvoteRequest = z.object({
  type: z.literal("question:upvote"),
  id: z.string(),
});

export const SyncRequest = z.object({
  type: z.literal("sync:request"),
});

export const ClientMessage = z.discriminatedUnion("type", [
  NavigateRequest,
  LaserUpdate,
  QuestionSubmit,
  QuestionUpvoteRequest,
  SyncRequest,
]);

export type ClientMessage = z.infer<typeof ClientMessage>;
