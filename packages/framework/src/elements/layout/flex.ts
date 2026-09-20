import { injectStyles } from "../../utils/styles.js";

import flexCss from "./flex.css?raw";

injectStyles(flexCss, "flex");

/**
 * Flexbox container with simple gap/justify/align/mode controls. Maps
 * attributes to internal CSS custom properties consumed by the stylesheet.
 *
 * @tag ds-flex
 * @attr gap - Gap between items in `rem` (numeric, default `0.5`)
 * @attr justify - CSS `justify-content` value (default `start`)
 * @attr align - CSS `align-items` value
 * @attr mode - CSS `flex-direction` value (e.g. `row`, `column`)
 */
export class DsFlex extends HTMLElement {
  static observedAttributes = ["gap", "justify", "align", "mode"] as const;

  attributeChangedCallback(
    name: (typeof DsFlex.observedAttributes)[number],
    _oldValue: string,
    newValue: string,
  ) {
    if (name === "gap") {
      const parsed = Number(newValue);
      this.style.setProperty(
        "--gap",
        `${Number.isNaN(parsed) ? 0.5 : parsed}rem`,
      );
    } else if (name === "justify") {
      this.style.setProperty("--justify", newValue ?? "start");
    } else if (name === "align") {
      this.style.setProperty("--align", newValue);
    } else if (name === "mode") {
      this.style.setProperty("--flex-direction", newValue);
    }
  }
}
if (!customElements.get("ds-flex")) {
  customElements.define("ds-flex", DsFlex);
}
