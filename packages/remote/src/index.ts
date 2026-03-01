import type { ServerMessage } from "@dotslide/protocol";
import { captureAndUpload } from "./capture";
import { LaserOverlay } from "./laser";
import { SyncAdapter } from "./sync";

export type RemoteOptions = {
  autoReconnect?: boolean;
  captureSlides?: boolean;
  reconnectMaxDelay?: number;
};

/**
 * Connect the current presentation to a dotslide control server.
 *
 * Finds the `ds-slideshow` element on the page, attaches to its
 * SlideshowContext nanostores, and opens a WebSocket to the server.
 *
 * This function is idempotent — calling it multiple times will
 * reuse the existing connection.
 */
export function connectToServer(
  serverUrl: string,
  options: RemoteOptions = {},
) {
  const {
    autoReconnect = true,
    captureSlides = true,
    reconnectMaxDelay = 30_000,
  } = options;

  const wsUrl = `${serverUrl.replace(/^http/, "ws")}/ws`;
  let ws: WebSocket;
  let reconnectDelay = 1000;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const syncAdapter = new SyncAdapter();
  const laserOverlay = new LaserOverlay();

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.addEventListener("open", () => {
      console.debug("[dotslide] Connected to server");
      reconnectDelay = 1000; // reset on successful connect
      syncAdapter.attach(ws);
    });

    ws.addEventListener("message", (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data as string);
        handleServerMessage(msg);
      } catch {
        console.warn("[dotslide] Invalid message from server");
      }
    });

    ws.addEventListener("close", () => {
      console.debug("[dotslide] Disconnected from server");
      syncAdapter.detach();
      if (autoReconnect) {
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, reconnectMaxDelay);
          connect();
        }, reconnectDelay);
      }
    });

    ws.addEventListener("error", (e) => {
      console.warn("[dotslide] WebSocket error", e);
    });
  }

  function handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case "navigate":
        syncAdapter.applyRemoteNavigation(msg.navigationIndex);
        break;
      case "sync":
        syncAdapter.applyFullSync(msg);
        break;
      case "laser":
        laserOverlay.update(msg.x, msg.y, msg.visible);
        break;
      case "role":
        console.debug(`[dotslide] Role assigned: ${msg.role}`);
        if (msg.role === "presenter" && captureSlides) {
          waitForReady().then(() => captureAndUpload(serverUrl));
        }
        break;
      case "question":
      case "question:upvote":
        // Q&A is handled by the controller UI, not the presentation
        break;
      case "error":
        console.warn(`[dotslide] Server error: ${msg.message}`);
        break;
    }
  }

  connect();

  return {
    disconnect() {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      syncAdapter.detach();
      laserOverlay.destroy();
    },
  };
}

/**
 * Wait for the slideshow to be ready (all resources loaded).
 * Resolves immediately if already ready.
 */
function waitForReady(): Promise<void> {
  return new Promise((resolve) => {
    // TODO Consider subscribing to the Slideshow context instead!
    const check = () => {
      const slideshow = document.querySelector<HTMLElement>("ds-slideshow");
      if (slideshow?.getAttribute("data-ready") === "true") {
        resolve();
        return;
      }
      // Poll until ready
      requestAnimationFrame(check);
    };
    check();
  });
}
