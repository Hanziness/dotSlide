import { atom } from "nanostores";

/**
 * Connection states for the dotslide remote client.
 *
 * - `standalone`  — No server connection; presentation runs locally.
 * - `connecting`  — WebSocket connection attempt in progress.
 * - `connected-viewer`  — Live server connection without presenter privileges.
 * - `connected-presenter`  — Live server connection with presenter privileges.
 * - `reconnecting`  — Connection lost; attempting to reconnect.
 */
export type ConnectionState =
  | "standalone"
  | "connecting"
  | "connected-viewer"
  | "connected-presenter"
  | "reconnecting";

/**
 * Observable client-side connection state.
 *
 * Starts as `standalone` and transitions based on WebSocket lifecycle
 * and server-assigned role. Subscribe via nanostores `.subscribe()` or
 * `.listen()` to react to state changes.
 *
 * @example
 * ```ts
 * import { connectionState } from "@dotslide/remote";
 *
 * connectionState.subscribe((state) => {
 *   console.log("Connection state:", state);
 * });
 * ```
 */
export const connectionState = atom<ConnectionState>("standalone");
