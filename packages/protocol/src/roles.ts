export const Role = {
  Presenter: "presenter",
  Viewer: "viewer",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** Which client message types each role is allowed to send */
export const permissions: Record<Role, Set<string>> = {
  presenter: new Set([
    "navigate",
    "laser",
    "question",
    "question:upvote",
    "sync:request",
  ]),
  viewer: new Set(["question", "question:upvote", "sync:request"]),
};
