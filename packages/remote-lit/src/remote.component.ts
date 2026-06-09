import { useSlideshowContext } from "@dotslide/framework";
import type { SlideshowStore } from "@dotslide/framework/store";
import {
  type Client,
  createAuthClientInstance,
  dsClient,
} from "@dotslide/server/client";
import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import remoteCSS from "./remote.css?inline";

import "./connect-button.component";
import { provide } from "@lit/context";
import { type RemoteContext, remoteContext } from "./context";

/**
 * Root remote control component for dotSlide presentations.
 *
 * Authenticates with the server, manages room lifecycle, and provides
 * RemoteContext to child components via Lit context.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("ds-remote")
export class Remote extends LitElement {
  static styles = unsafeCSS(remoteCSS);

  @provide({ context: remoteContext })
  @state()
  private _remoteContext: RemoteContext;

  @property({ type: String, attribute: true, useDefault: true })
  host: string = window.location.hostname;

  @property({ type: Number, attribute: true, useDefault: true })
  serverPort: number = 9876;

  @property({ type: Number, attribute: true, useDefault: true })
  controllerPort: number = 5173;

  /** WebSocket connection to the dotSlide Server */
  @state()
  private wsConnection: WebSocket | undefined;

  @state()
  dsClient: Client = dsClient(`http://${this.host}:${this.serverPort}`, {
    init: {
      credentials: "include",
    },
  });

  @state()
  private authInstance = createAuthClientInstance(
    `http://${this.host}:${this.serverPort}`,
  );

  @state()
  roomId: string | undefined;

  private slideshowRoot = this.closest("ds-slideshow") as HTMLElement;
  private ctx: SlideshowStore;

  constructor() {
    super();

    console.info("[remote] New Remote initializing...");

    if (this.slideshowRoot === null) {
      throw new Error("Remote was not part of a `ds-slideshow` element");
    }

    this.ctx = useSlideshowContext(this.slideshowRoot);
    this.ctx.subscribe((value) => {
      console.warn("[remote][store]", value);
    });

    // Set up initial context with createRoom method
    this._remoteContext = {
      dsClient: this.dsClient,
      auth: this.authInstance,
      host: this.host,
      controllerPort: this.controllerPort,
      roomId: undefined,
      createRoom: this.createRoom.bind(this),
    };

    this.setup();
  }

  /** Authenticate with the server (called on initialization) */
  private async setup() {
    const res = await this.authInstance.signIn.anonymous();
    console.info("[remote] Authenticated:", res);
  }

  /**
   * Create a presentation room on the server and connect via WebSocket.
   * Called lazily when the user clicks the connect button.
   * @returns The room ID
   */
  async createRoom(): Promise<string> {
    if (this.roomId) {
      return this.roomId;
    }

    const createResponse = await this.dsClient.api.presenter.create.$post();
    if (!createResponse.ok) {
      throw new Error(
        `Failed to create room: ${JSON.stringify(await createResponse.json())}`,
      );
    }
    this.roomId = (await createResponse.json()).id;

    // Update context with the new roomId
    this._remoteContext = {
      ...this._remoteContext,
      roomId: this.roomId,
    };

    this.wsConnection = new WebSocket(
      this.dsClient.api.ws[":roomId"].$url({ param: { roomId: this.roomId } }),
    );
    this.wsConnection.onmessage = (ev) => {
      console.info("[remote][ws]", ev);
    };

    return this.roomId;
  }

  render() {
    return html`
      <ds-invite-button
        .host=${this.host}
        .controllerPort=${this.controllerPort}
      ></ds-invite-button>
    `;
  }
}