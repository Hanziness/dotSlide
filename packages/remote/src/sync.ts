import type { SlideshowStore } from "@dotslide/framework/store";
import { useSlideshowContext } from "@dotslide/framework/store";
import { connectionState } from "./connection-state";

/**
 * Bidirectional sync between SlideshowContext nanostores and
 * a WebSocket connection to the dotslide server.
 *
 * **Outbound gating**: Local navigation changes are only forwarded
 * to the server when the client is in `connected-presenter` state.
 * This prevents viewer sessions from mutating shared server state.
 * The server-side permission check in `ws/handlers.ts` remains the
 * final authority — this client-side gate is a UX optimization that
 * avoids sending messages that would be rejected anyway.
 *
 * **Inbound sync**: Remote navigation updates from the server are
 * always applied, regardless of role, so that both viewers and
 * presenters see the same slide.
 *
 * Uses a guard flag (`isRemoteUpdate`) to prevent echo loops:
 * when the server sends a navigation update, we apply it to the
 * store without re-sending it back.
 */
export class SyncAdapter {
  private ws: WebSocket | null = null;
  private store: SlideshowStore | null = null;
  private unsubscribe: (() => void) | null = null;
  private isRemoteUpdate = false;

  attach(ws: WebSocket) {
    this.ws = ws;

    // Find the SlideshowContext on the page
    const slideshow = document.querySelector<HTMLElement>("ds-slideshow");
    if (!slideshow) {
      console.warn("[dotslide/sync] No ds-slideshow element found");
      return;
    }

    this.store = useSlideshowContext(slideshow);

    // Listen for local navigation changes and forward to server
    // only when the client has presenter privileges
    this.unsubscribe = this.store.listen((_value, _oldValue, changedKey) => {
      if (changedKey !== "navigationIndex") return;
      if (this.isRemoteUpdate) return; // prevent echo
      if (connectionState.get() !== "connected-presenter") return;

      const { navigationIndex } = this.store?.get() ?? { navigationIndex: 0 };
      this.send({
        type: "navigate",
        action: "goTo",
        index: navigationIndex,
      });
    });
  }

  detach() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.ws = null;
  }

  /** Apply a remote navigation index without triggering a send-back */
  applyRemoteNavigation(navigationIndex: number) {
    if (!this.store) return;
    this.isRemoteUpdate = true;
    this.store.goTo(navigationIndex);
    this.isRemoteUpdate = false;
  }

  /** Apply a full state sync from the server */
  applyFullSync(state: {
    navigationIndex: number;
    numSlides: number;
    activeSlide: number;
    activeStep: number;
  }) {
    if (!this.store) return;
    this.isRemoteUpdate = true;
    this.store.goTo(state.navigationIndex);
    this.isRemoteUpdate = false;
  }

  private send(msg: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
