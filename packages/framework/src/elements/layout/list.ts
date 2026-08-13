import { injectStyles } from "../../utils/styles.js";

import listCss from "./list.css?raw";

injectStyles(listCss, "list");

export class DsList extends HTMLElement {
  static observedAttributes = ["start"] as const;

  attributeChangedCallback(
    name: (typeof DsList.observedAttributes)[number],
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === "start") {
      this.style.setProperty("--ds-list-start", newValue ?? "1");
    }
  }
}
if (!customElements.get("ds-list")) {
  customElements.define("ds-list", DsList);
}
