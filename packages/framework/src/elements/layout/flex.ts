import { injectStyles } from "../../utils/styles.js";

import flexCss from "./flex.css?raw";

injectStyles(flexCss, "flex");

export class DsFlex extends HTMLElement {
  static observedAttributes = ["gap", "justify", "align", "mode"] as const;

  attributeChangedCallback(
    name: (typeof DsFlex.observedAttributes)[number],
    _oldValue: string,
    newValue: string,
  ) {
    if (name === "gap") {
      const parsed = Number(newValue);
      this.style.setProperty("--gap", `${Number.isNaN(parsed) ? 0.5 : parsed}rem`);
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
