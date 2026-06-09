export { Remote } from "./remote.component";

declare global {
  interface HTMLElementTagNameMap {
    "ds-remote": import("./remote.component").Remote;
  }
}