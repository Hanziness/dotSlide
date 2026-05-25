import {
  type ClientMessage,
  type NavigationSnapshot,
  ServerMessage as ServerMessageSchema,
} from "@dotslide/protocol";
import { client } from "$lib/client";

type ControllerConnectionOptions = {
  roomId: string;
  onConnected: () => void;
  onDisconnected: () => void;
  onSyncState: (state: NavigationSnapshot) => void;
  onNavigationUpdate: (navigationIndex: number) => void;
};

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 10000;

const sameNavigationSnapshot = (
  current: NavigationSnapshot,
  next: NavigationSnapshot,
) => {
  return (
    current.navigationIndex === next.navigationIndex &&
    current.numSlides === next.numSlides &&
    current.activeSlide === next.activeSlide &&
    current.activeStep === next.activeStep &&
    current.numNavigationSteps === next.numNavigationSteps
  );
};

export class ControllerConnection {
  private readonly options: ControllerConnectionOptions;
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private shouldReconnect = false;
  private isDestroyed = false;

  constructor(options: ControllerConnectionOptions) {
    this.options = options;
  }

  start() {
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("pagehide", this.handlePageHide);

    if (document.visibilityState === "visible") {
      this.resume();
    }
  }

  stop() {
    this.isDestroyed = true;
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    window.removeEventListener("pagehide", this.handlePageHide);
    this.suspend();
  }

  sendNavigate(action: "prev" | "next") {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({ type: "navigate", action }));
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private disconnectSocket() {
    if (this.ws == null) {
      return;
    }

    const socket = this.ws;
    this.ws = null;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  }

  private scheduleReconnect() {
    this.clearReconnectTimer();

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempt,
      RECONNECT_MAX_DELAY_MS,
    );
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private connect() {
    if (
      this.isDestroyed ||
      document.visibilityState !== "visible" ||
      this.ws != null
    ) {
      return;
    }

    this.shouldReconnect = true;

    const socket = new WebSocket(
      client.api.ws[":roomId"].$url({ param: { roomId: this.options.roomId } }),
    );
    this.ws = socket;

    socket.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);
      const result = ServerMessageSchema.safeParse(parsed);

      if (!result.success) {
        console.error("Invalid server message", result.error);
        return;
      }

      const data = result.data;

      if (data.type === "sync") {
        const { type: _type, ...navData } = data;
        if (
          this.lastSync != null &&
          sameNavigationSnapshot(this.lastSync, navData)
        ) {
          return;
        }

        this.lastSync = navData;
        this.options.onSyncState(navData);
        return;
      }

      if (data.type === "navigate") {
        this.options.onNavigationUpdate(data.navigationIndex);
      }
    };

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.options.onConnected();
      socket.send(JSON.stringify({ type: "sync:request" } as ClientMessage));
    };

    socket.onclose = () => {
      if (this.ws === socket) {
        this.ws = null;
      }

      this.options.onDisconnected();

      if (
        this.isDestroyed ||
        !this.shouldReconnect ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private suspend() {
    this.shouldReconnect = false;
    this.reconnectAttempt = 0;
    this.clearReconnectTimer();
    this.options.onDisconnected();
    this.disconnectSocket();
  }

  private resume() {
    if (this.isDestroyed) {
      return;
    }

    this.shouldReconnect = true;
    this.clearReconnectTimer();
    this.connect();
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.suspend();
      return;
    }

    this.resume();
  };

  private handlePageHide = () => {
    this.suspend();
  };

  private lastSync: NavigationSnapshot | null = null;
}
