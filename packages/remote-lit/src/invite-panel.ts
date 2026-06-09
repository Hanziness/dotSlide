export { InvitePanel } from "./invite-panel.component";

declare global {
  interface HTMLElementTagNameMap {
    "ds-invite-panel": import("./invite-panel.component").InvitePanel;
  }
}