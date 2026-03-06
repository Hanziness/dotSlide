import { access } from "@dotslide/server/client";
import { createAuthClient } from "better-auth/client";
import { admin, anonymous, bearer } from "better-auth/plugins";

export const authClient = createAuthClient({
  plugins: [
    anonymous(), // Viewers get instant sessions (no sign-up)
    admin({
      ac: access.ac,
      roles: {
        presenter: access.presenter,
        viewer: access.viewer,
      },
    }), // Adds `role` field to user, enables role management
    bearer(), // Supports Authorization: Bearer for WS handshake
  ],
});
