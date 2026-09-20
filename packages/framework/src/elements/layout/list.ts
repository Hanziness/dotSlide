import { injectStyles } from "../../utils/styles.js";

import listCss from "./list.css?raw";

injectStyles(listCss, "list");

/**
 * List container. The visual style is driven by `data-mode` via CSS:
 * `ordered` renders numbered items (starting at `--ds-list-start`),
 * `unordered` renders bullets.
 *
 * @tag ds-list
 * @attr data-mode - List style: `ordered` | `unordered`
 * @cssprop --ds-list-start - Counter start value for ordered lists (default `1`)
 */
export class DsList extends HTMLElement {
  // Empty CE — just a container with CSS
}
if (!customElements.get("ds-list")) {
  customElements.define("ds-list", DsList);
}
