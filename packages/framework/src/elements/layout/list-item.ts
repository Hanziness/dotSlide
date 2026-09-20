import { injectStyles } from "../../utils/styles.js";

import listItemCss from "./list-item.css?raw";

injectStyles(listItemCss, "list-item");

/**
 * List item inside a `ds-list`. Marker glyph and color come from CSS pseudo-
 * elements on the parent `ds-list` based on its `mode`.
 *
 * @tag ds-list-item
 * @cssprop --ds-list-marker-color - Color of the marker glyph
 */
export class DsListItem extends HTMLElement {
  // Empty CE — styling via CSS pseudo-elements
}
if (!customElements.get("ds-list-item")) {
  customElements.define("ds-list-item", DsListItem);
}
