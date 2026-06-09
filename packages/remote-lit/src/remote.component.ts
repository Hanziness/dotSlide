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
 * An example element.
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
  host: string | undefined = window.location.hostname;

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

    console.info(remoteCSS);
    console.info("[remote] New Remote initializing...");

    this._remoteContext = {
      dsClient: this.dsClient,
      auth: this.authInstance,
    };

    if (this.slideshowRoot === null) {
      throw new Error("Remote was not part of a `ds-slideshow` element");
    }

    this.ctx = useSlideshowContext(this.slideshowRoot);
    this.ctx.subscribe((value) => {
      console.warn("[remote][store]", value);
    });

    this.setup();
  }

  async setup() {
    // Authenticate
    const res = await this.authInstance.signIn.anonymous();
    console.log(res);

    // Create room
    const createResponse = await this.dsClient.api.presenter.create.$post();
    if (!createResponse.ok) {
      throw new Error(
        `Failed to create room: ${JSON.stringify(await createResponse.json())}`,
      );
    }
    this.roomId = (await createResponse.json()).id;

    this.wsConnection = new WebSocket(
      this.dsClient.api.ws[":roomId"].$url({ param: { roomId: this.roomId } }),
    );
    this.wsConnection.onmessage = (ev) => {
      console.info(ev);
    };
  }

  render() {
    return html`
    <ds-invite-button></ds-invite-button>
     `;
  }
}
