import { consume } from "@lit/context";
import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import connectButtonCSS from "./connect-button.css?inline";
import "./invite-panel.component";
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

  @property({ type: String, attribute: true })
  host = "";

  @property({ type: Number, attribute: true })
  controllerPort = 5173;

  @state()
  private invite?: InviteLink;

  @state()
  private panelOpen = false;

  private async handleConnect() {
    if (!this.remoteCtx) {
      return;
    }

    // Ensure a room exists before creating an invite
    const roomId = await this.remoteCtx.createRoom();

    const invite = await this.remoteCtx.dsClient.api.presenter[
      ":roomId"
    ].invite.$post({ param: { roomId } });

    if (invite.ok) {
      const body = await invite.json();
      this.invite = {
        token: body.token,
        expires: new Date(),
      };
      this.panelOpen = true;
    } else {
      const err = await invite.json();
      console.error("[ds-invite-button] Failed to create invite:", err);
    }
  }

  private handleClose() {
    this.panelOpen = false;
  }

  private get inviteUrl(): string {
    if (!this.invite) {
      return "";
    }
    return `http://${this.host}:${this.controllerPort}/join?token=${this.invite.token}`;
  }

  render() {
    return html`
      <button @click="${this.handleConnect}" aria-label="Connect controller">
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
      <ds-invite-panel
        .url=${this.inviteUrl}
        .open=${this.panelOpen}
        @ds-invite-close=${this.handleClose}
      ></ds-invite-panel>
    `;
  }
}