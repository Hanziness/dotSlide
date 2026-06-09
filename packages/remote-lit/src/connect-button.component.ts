import { consume } from "@lit/context";
import { html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import connectButtonCSS from "./connect-button.css?inline";
import { type RemoteContext, remoteContext } from "./context";

export type InviteLink = {
  token: string;
  expires: Date;
};

@customElement("ds-invite-button")
export class InviteButton extends LitElement {
  static styles = unsafeCSS(connectButtonCSS);
  @consume({ context: remoteContext })
  private remoteCtx?: RemoteContext;

  @state()
  roomId?: string;

  @state()
  invite?: InviteLink;

  constructor() {
    super();

    if (!this.remoteCtx) {
      throw new Error("Remote context not set");
    }
  }

  /** @throws Throws an error if room creation failed */
  private async createRoom() {
    if (this.roomId || !this.remoteCtx) {
      return;
    }

    const res = await this.remoteCtx.dsClient.api.presenter.create.$post();

    if (res.ok) {
      const body = await res.json();
      this.roomId = body.id;
    } else {
      const err = (await res.json()).error;
      throw new Error(`Failed to create room: ${JSON.stringify(err)}`);
    }
  }

  private async createInvite() {
    if (!this.remoteCtx) {
        return;
    }

    if (!this.roomId) {
      await this.createRoom();
    }

    const roomId = this.roomId as string;
    const invite = await this.remoteCtx.dsClient.api.presenter[
      ":roomId"
    ].invite.$post({ param: { roomId } });

    if (invite.ok) {
      const body = await invite.json();
      this.invite = {
        token: body.token,
        expires: new Date(),
      };

      console.info(this.invite);
    }
  }

  render() {
    return html`
            <button @click="${this.createInvite}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-screen-share">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
                    <path d="M7 20l10 0" />
                    <path d="M9 16l0 4" />
                    <path d="M15 16l0 4" />
                    <path d="M17 4h4v4" />
                    <path d="M16 9l5 -5" />
                </svg>
            </button>
        `;
  }
}
