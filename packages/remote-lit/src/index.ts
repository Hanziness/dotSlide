import type { Remote } from "./remote";

export { Remote } from "./remote";
export { InviteButton } from "./connect-button";
export type { InviteLink } from "./connect-button";

declare global {
  interface HTMLElementTagNameMap {
    "ds-remote": Remote;
  }
}