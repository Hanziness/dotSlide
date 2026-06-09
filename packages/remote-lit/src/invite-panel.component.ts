import { html, LitElement, unsafeCSS } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { customElement, property } from "lit/decorators.js";
import { renderSVG } from "uqr";
import invitePanelCSS from "./invite-panel.css?inline";

/**
 * A popover panel that displays a QR code for an invite URL.
 *
 * @attr url - The invite URL to encode as a QR code
 * @attr open - Whether the panel is visible
 * @fires ds-invite-close - When the close button is clicked
 */
@customElement("ds-invite-panel")
export class InvitePanel extends LitElement {
  static styles = unsafeCSS(invitePanelCSS);

  @property({ type: String })
  url = "";

  @property({ type: Boolean, reflect: true })
  open = false;

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent("ds-invite-close", { bubbles: true, composed: true }),
    );
  }

  render() {
    if (!this.open || !this.url) {
      return html``;
    }

    const qrSvg = renderSVG(this.url, { border: 2 });

    return html`
      <div class="panel">
        <div class="panel-header">
          <p class="panel-title">Connect a controller</p>
          <button class="close-btn" @click=${this.handleClose} aria-label="Close">&times;</button>
        </div>
        <div class="qr-container">${unsafeSVG(qrSvg)}</div>
        <a class="invite-url" href=${this.url} target="_blank" rel="noopener noreferrer">${this.url}</a>
      </div>
    `;
  }
}