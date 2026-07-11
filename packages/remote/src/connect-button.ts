export type { InviteLink } from "./connect-button.component";
export { InviteButton } from "./connect-button.component";

declare global {
  interface HTMLElementTagNameMap {
    "ds-invite-button": import("./connect-button.component").InviteButton;
  }
}
