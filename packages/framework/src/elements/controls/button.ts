import { withSlideshowContext } from "../../store/context/slideshow.js";
import { injectStyles } from "../../utils/styles.js";

import buttonCss from "./button.css?raw";

injectStyles(buttonCss, "button");

/**
 * Navigation button that dispatches a slideshow action on click. If no
 * `<button>` child is provided, one is created and the element's children
 * are moved into it.
 *
 * Requires a `ds-slideshow` ancestor; otherwise the action is ignored.
 *
 * @tag ds-button
 * @attr action - Action to dispatch on click: `next` | `prev` | `first` | `last`
 * @cssprop --ds-control-bg - Button background color
 * @cssprop --ds-control-radius - Button border radius
 * @cssprop --ds-control-shadow - Button box-shadow
 */
export class DsButton extends HTMLElement {
  private _clickHandler?: (e: Event) => void;

  connectedCallback() {
    if (!this.querySelector("button")) {
      const btn = document.createElement("button");
      btn.type = "button";
      while (this.firstChild) btn.appendChild(this.firstChild);
      this.appendChild(btn);
    }

    const action = this.getAttribute("action") as
      | "next"
      | "prev"
      | "first"
      | "last"
      | null;
    if (action === null) return;

    withSlideshowContext(this, (ctx) => {
      const btn = this.querySelector("button")!;
      this._clickHandler = (e) => {
        e.stopPropagation();
        ctx[action]();
      };
      btn.addEventListener("click", this._clickHandler);
    });
  }

  disconnectedCallback() {
    if (this._clickHandler) {
      const btn = this.querySelector("button");
      btn?.removeEventListener("click", this._clickHandler);
      this._clickHandler = undefined;
    }
  }
}

if (!customElements.get("ds-button")) {
  customElements.define("ds-button", DsButton);
}
