import { injectStyles } from "../../utils/styles.js";

import listCss from "./list.css?raw";

injectStyles(listCss, "list");

/**
 * List container. The visual style is driven by `mode` via CSS:
 * `ordered` renders numbered items (starting at `--ds-list-start`),
 * `unordered` renders bullets.
 *
 * @tag ds-list
 * @attr mode - List style: `ordered` | `unordered`
 * @cssprop --ds-list-start - Counter start value for ordered lists (default `1`)
 */
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
